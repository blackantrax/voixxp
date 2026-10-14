import "server-only";
import type { PaidPlan } from "./plans";

// Verification d'une session Stripe Checkout (lien de paiement). Cle restreinte en lecture suffisante :
// Checkout Sessions + Subscriptions (lecture). Sans cle, la verification est simplement sautee.
type Session = {
  id: string;
  status: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
  subscription?: { id: string; metadata?: Record<string, string>; current_period_end?: number; items?: { data?: { current_period_end?: number }[] } } | string | null;
};

export type StripeResult = { ok: boolean; plan?: PaidPlan; email?: string; amount?: number; currency?: string; ref?: string; periodEnd?: Date; reason?: string };

export async function verifyCheckoutSession(sessionId: string): Promise<StripeResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, reason: "cle Stripe absente" };
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return { ok: false, reason: "session invalide" };
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const s = (await res.json().catch(() => null)) as Session | null;
  if (!res.ok || !s) return { ok: false, reason: `verification impossible (${res.status})` };
  if (s.status !== "complete" || s.payment_status !== "paid") return { ok: false, reason: `statut ${s.status}/${s.payment_status}` };
  const sub = typeof s.subscription === "object" ? s.subscription : null;
  const plan = (s.metadata?.plan ?? sub?.metadata?.plan) as PaidPlan | undefined;
  if (plan !== "createur" && plan !== "studio") return { ok: false, reason: "forfait inconnu" };
  const end = sub?.items?.data?.[0]?.current_period_end ?? sub?.current_period_end;
  return {
    ok: true,
    plan,
    email: s.customer_details?.email ?? undefined,
    amount: s.amount_total ?? 0,
    currency: (s.currency ?? "cad").toUpperCase(),
    ref: sub?.id ?? s.id,
    periodEnd: end ? new Date(end * 1000) : undefined,
  };
}
