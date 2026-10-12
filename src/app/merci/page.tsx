import type { Metadata } from "next";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

export const metadata: Metadata = { title: "Bienvenue", robots: { index: false } };

export default function Merci() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <PartyPopper className="mx-auto h-12 w-12 text-brand-300" />
      <h1 className="mt-6 text-3xl font-bold">Bienvenue parmi les membres fondateurs !</h1>
      <p className="mt-4 text-zinc-400">
        Votre abonnement est actif et votre prix fondateur est garanti à vie. Votre reçu arrive par courriel.
        Nous vous écrivons dès que le clonage de voix est activé sur votre compte.
      </p>
      <Link href="/studio" className="btn-primary mt-8">Ouvrir le studio</Link>
    </div>
  );
}
