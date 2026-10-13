import "server-only";
import { MOBILE_MONEY, type PaidPlan } from "./plans";

// Flutterwave API v3. Les valeurs viennent des variables d'environnement Vercel, jamais du code.
const base = () => (process.env.FLUTTERWAVE_API_BASE_URL || "https://api.flutterwave.com/v3").replace(/\/$/, "");
const secret = () => process.env.FLUTTERWAVE_SECRET_KEY;

// Diagnostic sans secret : hote de l'API et type de cle (prefixe avant le premier tiret, ex. FLWSECK_TEST).
export function diagnostic() {
  let host = "?";
  try { host = new URL(base()).host + new URL(base()).pathname; } catch {}
  const key = secret() ?? "";
  return `api=${host} cle=${key.split("-")[0] || "absente"} longueur=${key.length}`;
}

export const flutterwaveEnabled = () => Boolean(secret());

export const webhookHash = () => process.env.FLUTTERWAVE_V3_WEBHOOK_HASH || process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;

async function call<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T | null }> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  return { ok: res.ok, status: res.status, body: (await res.json().catch(() => null)) as T | null };
}

export async function createPayment(opts: { plan: PaidPlan; email: string; origin: string }) {
  const amount = MOBILE_MONEY.plans[opts.plan];
  const txRef = `voixxp-${opts.plan}-${crypto.randomUUID()}`;
  const res = await call<{ status: string; message?: string; data?: { link: string } }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: MOBILE_MONEY.currency,
      redirect_url: `${opts.origin}/merci?fournisseur=flutterwave`,
      payment_options: "mobilemoneyfranco,card",
      customer: { email: opts.email },
      customizations: {
        title: "VoixXP",
        description: `Forfait ${opts.plan === "createur" ? "Créateur" : "Studio"} — 1 mois`,
        logo: `${opts.origin}/apple-icon.png`,
      },
      meta: { produit: "voixxp", plan: opts.plan },
    }),
  });
  return { txRef, link: res.body?.data?.link ?? null, error: res.ok ? null : `${res.status} ${res.body?.message ?? ""} | ${diagnostic()}` };
}

export type VerifiedPayment = { ok: boolean; plan?: PaidPlan; amount?: number; currency?: string; reason?: string };

// Re-verifie une transaction aupres de Flutterwave : on ne se fie jamais aux parametres de l'URL de retour.
export async function verifyTransaction(transactionId: string, expectedTxRef?: string): Promise<VerifiedPayment> {
  if (!/^\d+$/.test(transactionId)) return { ok: false, reason: "identifiant invalide" };
  const res = await call<{ status: string; data?: { status: string; tx_ref: string; amount: number; currency: string; meta?: { plan?: string } } }>(
    `/transactions/${transactionId}/verify`,
  );
  const d = res.body?.data;
  if (!res.ok || !d) return { ok: false, reason: `verification impossible (${res.status})` };
  if (expectedTxRef && d.tx_ref !== expectedTxRef) return { ok: false, reason: "reference differente" };
  const plan = d.tx_ref.split("-")[1] as PaidPlan;
  const expected = MOBILE_MONEY.plans[plan];
  if (d.status !== "successful") return { ok: false, reason: `statut ${d.status}` };
  if (!expected || d.currency !== MOBILE_MONEY.currency || d.amount < expected) return { ok: false, reason: "montant ou devise inattendus" };
  return { ok: true, plan, amount: d.amount, currency: d.currency };
}
