import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PAID_PLANS, type PaidPlan } from "./plans";
import { supabaseAdmin } from "./supabase/admin";

// Integration Stripe Billing sans SDK : Checkout heberge (abonnement), portail client, webhooks.
// Cle restreinte conseillee (STRIPE_SECRET_KEY) : ecriture Checkout Sessions et Customer portal,
// lecture Subscriptions, Customers, Invoices.

const key = () => process.env.STRIPE_SECRET_KEY;
export const stripeEnabled = () => Boolean(key());

export function priceFor(plan: PaidPlan) {
  const env = plan === "createur" ? process.env.STRIPE_PRICE_CREATEUR : process.env.STRIPE_PRICE_STUDIO;
  return env || PAID_PLANS[plan].price;
}

function planFromPrice(priceId?: string): PaidPlan | undefined {
  return (Object.keys(PAID_PLANS) as PaidPlan[]).find((p) => priceFor(p) === priceId);
}

// Encodage application/x-www-form-urlencoded avec les crochets attendus par Stripe.
function form(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const name = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") form(v as Record<string, unknown>, name, out);
    else out.append(name, String(v));
  }
  return out;
}

async function stripe<T>(method: "GET" | "POST", path: string, body?: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: T & { error?: { message?: string } } }> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${key()}`, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: body ? form(body) : undefined,
    cache: "no-store",
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

export type StripeSubscription = {
  id: string;
  status: string;
  customer: string;
  cancel_at_period_end: boolean;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data?: { current_period_end?: number; price?: { id: string; unit_amount: number | null; currency: string } }[] };
};

// --- Checkout ---------------------------------------------------------------------------------
export async function createCheckout(o: { plan: PaidPlan; origin: string; email?: string; userId?: string; customerId?: string }) {
  const r = await stripe<{ url?: string }>("POST", "/checkout/sessions", {
    mode: "subscription",
    line_items: { 0: { price: priceFor(o.plan), quantity: 1 } },
    success_url: `${o.origin}/merci?fournisseur=stripe&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${o.origin}/#tarifs`,
    customer: o.customerId,
    customer_email: o.customerId ? undefined : o.email,
    client_reference_id: o.userId,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    locale: "fr-CA",
    metadata: { produit: "voixxp", plan: o.plan },
    subscription_data: { metadata: { produit: "voixxp", plan: o.plan } },
    custom_text: { submit: { message: "Prix fondateur garanti à vie. Résiliable en tout temps depuis « Mon compte »." } },
  });
  if (!r.ok || !r.data.url) console.error("[stripe] checkout", r.status, r.data.error?.message);
  return r.data.url ?? null;
}

// --- Portail client ---------------------------------------------------------------------------
export async function createPortal(customerId: string, returnUrl: string) {
  const r = await stripe<{ url?: string }>("POST", "/billing_portal/sessions", { customer: customerId, return_url: returnUrl });
  if (!r.ok || !r.data.url) console.error("[stripe] portail", r.status, r.data.error?.message);
  return r.data.url ?? null;
}

// --- Synchronisation vers Supabase ------------------------------------------------------------
export async function getSubscription(id: string) {
  const r = await stripe<StripeSubscription>("GET", `/subscriptions/${encodeURIComponent(id)}`);
  return r.ok ? r.data : null;
}

const STATUS: Record<string, string> = {
  active: "active", trialing: "active", past_due: "active",
  canceled: "canceled", unpaid: "expired", incomplete_expired: "expired", incomplete: "pending", paused: "expired",
};

export async function syncSubscription(sub: StripeSubscription, extra: { email?: string | null; userId?: string | null } = {}) {
  const db = supabaseAdmin();
  if (!db) return;
  const item = sub.items?.data?.[0];
  const plan = (sub.metadata?.plan as PaidPlan | undefined) ?? planFromPrice(item?.price?.id);
  if (plan !== "createur" && plan !== "studio") return console.error("[stripe] forfait inconnu", sub.id);
  const end = item?.current_period_end ?? sub.current_period_end;
  const row: Record<string, unknown> = {
    provider: "stripe",
    provider_ref: sub.id,
    plan,
    status: STATUS[sub.status] ?? "expired",
    amount: item?.price?.unit_amount ?? 0,
    currency: (item?.price?.currency ?? "cad").toUpperCase(),
    current_period_end: end ? new Date(end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    stripe_customer_id: sub.customer,
  };
  if (extra.email) row.email = extra.email.toLowerCase();
  if (extra.userId && /^[0-9a-f-]{36}$/.test(extra.userId)) row.user_id = extra.userId;
  const { error } = await db.from("subscriptions").upsert(row, { onConflict: "provider,provider_ref" });
  if (error) console.error("[stripe] synchro", error.message);
}

// --- Retour de Checkout (/merci) --------------------------------------------------------------
type Session = {
  id: string; status: string; payment_status: string; client_reference_id?: string | null;
  customer_details?: { email?: string | null } | null; subscription?: StripeSubscription | string | null;
};

export async function confirmCheckoutSession(sessionId: string) {
  if (!stripeEnabled() || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return false;
  const r = await stripe<Session>("GET", `/checkout/sessions/${sessionId}?expand[]=subscription`);
  const s = r.data;
  if (!r.ok || s.status !== "complete" || s.payment_status !== "paid" || typeof s.subscription !== "object" || !s.subscription) {
    console.error("[stripe] session non confirmee", r.status, s.status, s.payment_status);
    return false;
  }
  await syncSubscription(s.subscription, { email: s.customer_details?.email, userId: s.client_reference_id });
  return true;
}

// --- Webhooks ---------------------------------------------------------------------------------
// Verifie l'en-tete Stripe-Signature (HMAC-SHA256, tolerance 5 min) sans SDK.
export function verifyWebhook(payload: string, header: string | null, secret: string, toleranceSec = 300) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=", 2)).filter((p) => p.length === 2)) as Record<string, string>;
  const t = Number(parts.t);
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || sigs.length === 0 || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}
