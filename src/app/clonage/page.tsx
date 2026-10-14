import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { CloneForm } from "@/components/CloneForm";

export const metadata: Metadata = { title: "Clonage de voix", description: "Clonez votre voix à partir de 10 secondes d'audio." };

export default function ClonagePage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Essai gratuit, puis forfait Créateur</p>
        <h1 className="text-4xl font-bold leading-tight">Votre voix, dans toutes vos vidéos. <span className="gradient-text">Sans micro.</span></h1>
        <p className="text-zinc-400">
          Enregistrez 10 secondes, puis générez vos voix off, vos pubs et vos épisodes en tapant votre script.
          Le clonage repose sur Chatterbox multilingue (licence MIT), un modèle open source qui tourne sur nos
          serveurs GPU, en 7 langues dont le français. Essai gratuit de 300 caractères, puis 100 000 caractères
          par mois (environ 2 h d&apos;audio) avec le forfait Créateur.
        </p>
        <ul className="space-y-3 text-sm text-zinc-300">
          <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" /> Consentement vérifié avant chaque clonage.</li>
          <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" /> Vos échantillons ne servent jamais à entraîner d&apos;autres modèles.</li>
          <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" /> Votre échantillon sert uniquement à générer votre audio : VoixXP ne le conserve pas.</li>
        </ul>
      </div>
      <CloneForm />
    </div>
  );
}
