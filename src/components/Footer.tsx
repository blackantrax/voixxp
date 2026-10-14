import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-zinc-400 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p>Le studio de voix IA des créateurs de contenu. Une solution de la famille XP.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-200">Produit</p>
          <Link href="/studio" className="block hover:text-white">Studio</Link>
          <Link href="/clonage" className="block hover:text-white">Clonage de voix</Link>
          <Link href="/#tarifs" className="block hover:text-white">Tarifs</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-200">Contact</p>
          <a href="mailto:bonjour@voixxp.com" className="block hover:text-white">bonjour@voixxp.com</a>
          <Link href="/#tarifs" className="block hover:text-white">Agences et partenariats</Link>
          <Link href="/conditions" className="block hover:text-white">Conditions d&apos;utilisation</Link>
          <Link href="/confidentialite" className="block hover:text-white">Confidentialité</Link>
          <Link href="/remboursement" className="block hover:text-white">Remboursements</Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} XP Media Inc. VoixXP est une marque de XP Media Inc. ElevenLabs est une marque de son propriétaire ; VoixXP n&apos;y est pas affilié.</p>
    </footer>
  );
}
