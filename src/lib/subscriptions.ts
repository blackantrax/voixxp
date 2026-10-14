import "server-only";
import { supabaseAdmin } from "./supabase/admin";
import type { PaidPlan } from "./plans";

const DAYS_30 = 30 * 24 * 3600 * 1000;

// Paiement Mobile Money lance : on garde la trace (courriel, numero) pour le rattacher ensuite.
export async function recordPending(o: { ref: string; plan: PaidPlan; email: string; phone?: string; amount: number; currency: string }) {
  const db = supabaseAdmin();
  if (!db) return;
  const { error } = await db.from("subscriptions").upsert(
    { provider: "flutterwave", provider_ref: o.ref, plan: o.plan, status: "pending", email: o.email, phone: o.phone ?? null, amount: o.amount, currency: o.currency },
    { onConflict: "provider,provider_ref", ignoreDuplicates: true },
  );
  if (error) console.error("[abonnements] enregistrement en attente", error.message);
}

// Paiement confirme aupres du fournisseur : forfait actif 30 jours. Idempotent (webhook + page de retour).
export async function activate(o: {
  ref: string; plan: PaidPlan; amount: number; currency: string; email?: string;
  provider?: "flutterwave" | "stripe"; periodEnd?: Date;
}) {
  const db = supabaseAdmin();
  if (!db) return;
  const provider = o.provider ?? "flutterwave";
  const { data: existing } = await db.from("subscriptions").select("id, status").eq("provider", provider).eq("provider_ref", o.ref).maybeSingle();
  if (existing?.status === "active") return;
  const row = { status: "active", amount: o.amount, currency: o.currency, current_period_end: (o.periodEnd ?? new Date(Date.now() + DAYS_30)).toISOString() };
  const { error } = existing
    ? await db.from("subscriptions").update(row).eq("id", existing.id)
    : await db.from("subscriptions").insert({ ...row, provider, provider_ref: o.ref, plan: o.plan, email: o.email?.toLowerCase() ?? null });
  if (error) console.error("[abonnements] activation", error.message);
}
