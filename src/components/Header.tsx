import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" aria-label="Accueil VoixXP"><Logo /></Link>
        <nav className="flex items-center gap-1 text-sm text-zinc-300 sm:gap-4">
          <Link href="/#voix" className="hidden px-2 hover:text-white sm:block">Voix</Link>
          <Link href="/clonage" className="hidden px-2 hover:text-white sm:block">Clonage</Link>
          <Link href="/#tarifs" className="px-2 hover:text-white">Tarifs</Link>
          <Link href="/compte" className="hidden px-2 hover:text-white sm:block">Mon compte</Link>
          <Link href="/studio" className="btn-primary !px-4 !py-2">Ouvrir le studio</Link>
        </nav>
      </div>
    </header>
  );
}
