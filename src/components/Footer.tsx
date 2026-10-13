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
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} VoixXP. ElevenLabs est une marque de son propriétaire ; VoixXP n&apos;y est pas affilié.</p>
    </footer>
  );
}
