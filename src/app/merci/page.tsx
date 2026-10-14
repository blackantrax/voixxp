import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, PartyPopper } from "lucide-react";
import { verifyTransaction } from "@/lib/flutterwave";
import { fcfa } from "@/lib/plans";
import { activate } from "@/lib/subscriptions";
import { confirmCheckoutSession } from "@/lib/stripe";

export const metadata: Metadata = { title: "Bienvenue", robots: { index: false } };
export const dynamic = "force-dynamic";

type Params = { fournisseur?: string; status?: string; tx_ref?: string; transaction_id?: string; session?: string };

export default async function Merci({ searchParams }: { searchParams: Params }) {
  // Retour de Flutterwave : on confirme le paiement aupres de l'API avant d'afficher quoi que ce soit.
  if (searchParams.fournisseur === "flutterwave") {
    const ok =
      searchParams.status !== "cancelled" && searchParams.transaction_id
        ? await verifyTransaction(searchParams.transaction_id, searchParams.tx_ref)
        : { ok: false, reason: "paiement annulé" };
    if (ok.ok && ok.plan && searchParams.tx_ref) await activate({ ref: searchParams.tx_ref, plan: ok.plan, amount: ok.amount!, currency: ok.currency! });
    if (!ok.ok) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <CircleAlert className="mx-auto h-12 w-12 text-amber-300" />
          <h1 className="mt-6 text-3xl font-bold">Paiement non confirmé</h1>
          <p className="mt-4 text-zinc-400">
            Nous n&apos;avons pas pu confirmer votre paiement ({ok.reason}). Aucun montant n&apos;a été retenu si le paiement a été annulé.
            Vous pouvez réessayer, ou nous écrire à bonjour@voixxp.com.
          </p>
          <Link href="/#tarifs" className="btn-primary mt-8">Revenir aux tarifs</Link>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <PartyPopper className="mx-auto h-12 w-12 text-brand-300" />
        <h1 className="mt-6 text-3xl font-bold">Paiement reçu, merci !</h1>
        <p className="mt-4 text-zinc-400">
          Nous avons bien reçu {ok.amount ? fcfa(ok.amount) : "votre paiement"} pour le forfait {ok.plan === "studio" ? "Studio" : "Créateur"} (1 mois).
          Votre reçu arrive par courriel. Nous vous écrivons dès que le clonage de voix est activé sur votre compte.
        </p>
        <Link href="/studio" className="btn-primary mt-8">Ouvrir le studio</Link>
      </div>
    );
  }

  // Retour de Stripe : on rattache l'abonnement au courriel du client (verifie aupres de Stripe).
  if (searchParams.fournisseur === "stripe" && searchParams.session) {
    await confirmCheckoutSession(searchParams.session);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <PartyPopper className="mx-auto h-12 w-12 text-brand-300" />
      <h1 className="mt-6 text-3xl font-bold">Bienvenue parmi les membres fondateurs !</h1>
      <p className="mt-4 text-zinc-400">
        Votre abonnement est actif et votre prix fondateur est garanti à vie. Votre reçu arrive par courriel.
        Retrouvez votre forfait dans « Mon compte » avec le courriel utilisé au paiement.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/compte" className="btn-primary">Mon compte</Link>
        <Link href="/studio" className="btn-ghost">Ouvrir le studio</Link>
      </div>
    </div>
  );
}
