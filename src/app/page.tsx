import Link from "next/link";
import { Check, Clapperboard, Globe2, Infinity as InfinityIcon, Lock, Mic2, Podcast, Megaphone, Zap, X } from "lucide-react";
import { LANGS, VOICES } from "@/lib/voices";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PAID_PLANS, dollars, type PaidPlan } from "@/lib/plans";

const PLANS = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: "0 $",
    tagline: "Pour essayer et pour les petits projets",
    features: ["Studio dans le navigateur, illimité", `${VOICES.length} voix en ${Object.keys(LANGS).length} langues`, "Export WAV", "Texte 100 % privé (rien n'est envoyé)"],
    cta: "Ouvrir le studio",
  },
  {
    id: "createur",
    name: "Créateur",
    price: "12 $",
    tagline: "Pour les influenceurs et les chaînes qui publient chaque semaine",
    features: ["Tout le forfait Gratuit", "Clonage de 3 voix (la vôtre incluse)", "2 h/mois de voix HD sur nos GPU", "Export MP3, licence commerciale", "Voix québécoises (bientôt)"],
    cta: "Réserver ma place",
    featured: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "39 $",
    tagline: "Pour les agences, podcasts et e-commerce",
    features: ["10 voix clonées, 10 h/mois", "Doublage de vos vidéos en 7 langues", "API et intégrations (Zapier, Make)", "3 sièges d'équipe"],
    cta: "Réserver ma place",
  },
];

const COMPARE = [
  ["Prix d'entrée pour le clonage", "Abonnement payant", "12 $/mois"],
  ["Synthèse de base", "Facturée au caractère", "Gratuite et illimitée"],
  ["Confidentialité du texte", "Envoyé dans le nuage", "Reste sur votre appareil"],
  ["Modèles", "Propriétaires", "Open source (Kokoro, Piper, Chatterbox)"],
  ["Version auto-hébergée pour entreprises", "Non", "Oui"],
];

const USES = [
  { icon: Clapperboard, title: "Voix off TikTok & Reels", text: "Des scripts lus en quelques secondes, avec la même voix sur toutes vos vidéos." },
  { icon: Podcast, title: "Podcasts & livres audio", text: "Transformez vos articles et infolettres en épisodes, sans studio d'enregistrement." },
  { icon: Megaphone, title: "Pubs & contenus de marque", text: "Testez dix accroches publicitaires en dix voix avant de choisir la gagnante." },
  { icon: Globe2, title: "Doublage multilingue", text: "Rejoignez les publics anglophone, hispanophone et européen avec votre propre voix." },
];

export default function Home() {
  const featured = VOICES.filter((v) => v.rating >= 4).slice(0, 8);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:pt-28">
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300">
            <Zap className="h-3.5 w-3.5 text-amber-300" /> L&apos;alternative open source à ElevenLabs
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Des voix off IA dignes d&apos;un studio, <span className="gradient-text">gratuites et sans limite.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Collez votre script, choisissez une voix, téléchargez. VoixXP fait tourner des modèles open source
            directement dans votre navigateur : pas de crédits, pas de compte, et votre texte ne quitte jamais votre appareil.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/studio" className="btn-primary px-8 py-4 text-base"><Mic2 className="h-5 w-5" /> Essayer gratuitement</Link>
            <Link href="/clonage" className="btn-ghost px-8 py-4 text-base">Cloner ma voix</Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4 text-sm">
            {[[InfinityIcon, "Caractères illimités"], [Lock, "100 % privé"], [Globe2, `${Object.keys(LANGS).length} langues`]].map(([Icon, label]) => {
              const I = Icon as typeof Lock;
              return (
                <div key={label as string} className="card flex flex-col items-center gap-2 p-4">
                  <I className="h-5 w-5 text-brand-300" />
                  <span className="text-zinc-300">{label as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="voix" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-3xl font-bold">Une voix pour chaque contenu</h2>
        <p className="mt-2 text-zinc-400">Cliquez sur une voix pour l&apos;essayer dans le studio.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <Link key={v.id} href={`/studio?voix=${v.id}`} className="card group flex items-center gap-3 p-4 transition hover:border-brand-400">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-bold ${v.gender === "F" ? "bg-glow-500/20 text-glow-400" : "bg-brand-500/20 text-brand-300"}`}>{v.name[0]}</span>
              <span className="min-w-0">
                <span className="block font-semibold group-hover:text-white">{v.name} <span className="text-xs font-normal text-zinc-500">· {LANGS[v.lang]}</span></span>
                <span className="block truncate text-xs text-zinc-500">{v.style}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Pensé pour les créateurs de contenu</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="h-6 w-6 text-brand-300" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">VoixXP ou ElevenLabs ?</h2>
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="p-4 font-medium" />
                <th className="p-4 font-medium">ElevenLabs</th>
                <th className="p-4 font-semibold text-white">VoixXP</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, a, b]) => (
                <tr key={k} className="border-b border-white/5 last:border-0">
                  <td className="p-4 text-zinc-300">{k}</td>
                  <td className="p-4 text-zinc-500"><span className="flex items-center gap-2"><X className="h-4 w-4 text-zinc-600" />{a}</span></td>
                  <td className="p-4 text-white"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{b}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Des tarifs simples, en dollars canadiens</h2>
        <p className="mt-2 text-center text-zinc-400">Commencez gratuitement. Passez à Créateur quand vous voulez votre propre voix.</p>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`card flex flex-col p-6 ${p.featured ? "border-brand-400 shadow-2xl shadow-brand-600/20" : ""}`}>
              {p.featured && <span className="mb-3 self-start rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">Le plus populaire</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{p.tagline}</p>
              {p.id === "gratuit" ? (
                <p className="mt-5 text-4xl font-extrabold">{p.price}</p>
              ) : (
                <p className="mt-5 text-4xl font-extrabold">
                  {dollars(PAID_PLANS[p.id as PaidPlan].founder)}
                  <span className="text-base font-normal text-zinc-500"> /mois</span>
                  <span className="ml-2 text-base font-normal text-zinc-500 line-through">{dollars(PAID_PLANS[p.id as PaidPlan].regular)}</span>
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-zinc-300"><Check className="h-4 w-4 shrink-0 text-emerald-400" />{f}</li>
                ))}
              </ul>
              <div className="mt-6">
                {p.id === "gratuit" ? (
                  <Link href="/studio" className="btn-ghost w-full">{p.cta}</Link>
                ) : (
                  <>
                    <p className="mb-2 text-xs text-zinc-500">Prix fondateur garanti à vie pour les 100 premiers membres. Le clonage ouvre en accès anticipé, membres en priorité. Résiliable en tout temps.</p>
                    <a href={PAID_PLANS[p.id as PaidPlan].link} className={p.featured ? "btn-primary w-full" : "btn-ghost w-full"}>
                      Devenir membre fondateur
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="card mx-auto mt-6 flex max-w-3xl flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="font-semibold">Agences et plateformes d&apos;influenceurs</h3>
            <p className="text-sm text-zinc-400">Marque blanche, hébergement dédié au Canada, voix exclusives pour vos talents.</p>
          </div>
          <div className="w-full sm:w-80"><WaitlistForm plan="agence" compact /></div>
        </div>
      </section>
    </>
  );
}
