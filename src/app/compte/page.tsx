import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };
export const dynamic = "force-dynamic";

const PLAN_NAMES: Record<string, string> = { createur: "Créateur", studio: "Studio" };

type Sub = { id: number; plan: string; status: string; amount: number; currency: string; provider: string; current_period_end: string | null; created_at: string };

const money = (s: Sub) =>
  s.currency === "XAF" ? `${s.amount.toLocaleString("fr-FR")} FCFA` : `${(s.amount / 100).toLocaleString("fr-CA")} ${s.currency === "CAD" ? "$" : s.currency}`;

export default async function Compte() {
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/connexion");

  const { data } = await supabase
    .from("subscriptions")
    .select("id, plan, status, amount, currency, provider, current_period_end, created_at")
    .in("status", ["active", "expired", "canceled"])
    .order("created_at", { ascending: false });
  const subs = (data ?? []) as Sub[];
  const now = Date.now();
  const active = subs.find((s) => s.status === "active" && s.current_period_end && new Date(s.current_period_end).getTime() > now);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon compte</h1>
          <p className="mt-1 text-sm text-zinc-400">{auth.user.email}</p>
        </div>
        <form action={signOut}><button className="btn-ghost">Se déconnecter</button></form>
      </div>

      <section className="card mt-8 p-6">
        <h2 className="font-semibold">Forfait</h2>
        {active ? (
          <div className="mt-4 flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
            <div>
              <p className="font-medium">VoixXP {PLAN_NAMES[active.plan] ?? active.plan} — actif</p>
              <p className="text-sm text-zinc-400">
                Jusqu&apos;au {new Date(active.current_period_end!).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}.
                Le clonage de voix s&apos;activera ici dès son ouverture.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-zinc-500" />
            <div>
              <p className="font-medium">Forfait Gratuit</p>
              <p className="text-sm text-zinc-400">Studio illimité dans le navigateur. Passez à Créateur pour cloner votre voix.</p>
              <Link href="/#tarifs" className="btn-primary mt-4">Voir les forfaits</Link>
            </div>
          </div>
        )}
      </section>

      <section className="card mt-6 p-6">
        <h2 className="font-semibold">Historique des paiements</h2>
        {subs.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Aucun paiement associé à ce courriel pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5 text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span>{new Date(s.created_at).toLocaleDateString("fr-CA")} · {PLAN_NAMES[s.plan] ?? s.plan} · {s.provider === "flutterwave" ? "Mobile Money" : "Carte"}</span>
                <span className="text-zinc-400">{money(s)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
