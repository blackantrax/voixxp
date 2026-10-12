import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-zinc-400 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p>Voix IA pour créateurs, propulsées par des modèles open source. Une solution de la famille XP.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-200">Produit</p>
          <Link href="/studio" className="block hover:text-white">Studio</Link>
          <Link href="/clonage" className="block hover:text-white">Clonage de voix</Link>
          <Link href="/#tarifs" className="block hover:text-white">Tarifs</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-200">Modèles open source</p>
          <a className="block hover:text-white" href="https://huggingface.co/hexgrad/Kokoro-82M" target="_blank" rel="noreferrer">Kokoro-82M (Apache 2.0)</a>
          <a className="block hover:text-white" href="https://github.com/rhasspy/piper" target="_blank" rel="noreferrer">Piper (MIT)</a>
          <a className="block hover:text-white" href="https://github.com/resemble-ai/chatterbox" target="_blank" rel="noreferrer">Chatterbox (MIT) — clonage</a>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} VoixXP. ElevenLabs est une marque de son propriétaire ; VoixXP n&apos;y est pas affilié.</p>
    </footer>
  );
}
