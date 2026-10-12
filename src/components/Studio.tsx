"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Lock, Play, Sparkles, Trash2, Wand2 } from "lucide-react";
import { LANGS, SAMPLE_TEXT, VOICES, type Voice } from "@/lib/voices";
import { onProgress, synthesize, type Progress } from "@/lib/tts";

type Take = { id: number; url: string; voice: Voice; text: string; seconds: number; ms: number };

const MAX_CHARS = 5000;

export function Studio({ initialVoice }: { initialVoice?: string }) {
  const [lang, setLang] = useState<Voice["lang"]>("fr");
  const [gender, setGender] = useState<"all" | "F" | "M">("all");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [text, setText] = useState(SAMPLE_TEXT.fr);
  const [speed, setSpeed] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [takes, setTakes] = useState<Take[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const v = VOICES.find((x) => x.id === initialVoice);
    if (v) { setLang(v.lang); setVoiceId(v.id); setText(SAMPLE_TEXT[v.lang]); }
  }, [initialVoice]);

  useEffect(() => {
    onProgress(setProgress);
    return () => onProgress(null);
  }, []);

  const voice = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
  const list = useMemo(
    () => VOICES.filter((v) => v.lang === lang && (gender === "all" || v.gender === gender)).sort((a, b) => b.rating - a.rating),
    [lang, gender],
  );

  function pickLang(l: Voice["lang"]) {
    setLang(l);
    const first = VOICES.filter((v) => v.lang === l).sort((a, b) => b.rating - a.rating)[0];
    if (first) setVoiceId(first.id);
    if (Object.values(SAMPLE_TEXT).includes(text) || !text.trim()) setText(SAMPLE_TEXT[l]);
  }

  async function generate(v: Voice = voice, input = text) {
    if (!input.trim() || busy) return;
    setBusy(true);
    setError(null);
    setProgress({ label: "Préparation du moteur", ratio: 0 });
    const t0 = performance.now();
    try {
      const { blob, seconds } = await synthesize(v.engine, input.trim(), v.id, speed);
      const take: Take = { id: Date.now(), url: URL.createObjectURL(blob), voice: v, text: input.trim(), seconds, ms: performance.now() - t0 };
      setTakes((t) => [take, ...t].slice(0, 20));
      requestAnimationFrame(() => {
        if (audioRef.current) { audioRef.current.src = take.url; audioRef.current.play().catch(() => {}); }
      });
    } catch (e) {
      setError(
        `La génération a échoué : ${(e as Error).message}. Essayez Chrome ou Edge récents, ou une voix plus légère.`,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Texte vers voix</h1>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            <Lock className="h-3.5 w-3.5" /> 100 % local : votre texte ne quitte pas votre appareil
          </span>
        </div>

        <textarea
          className="field mt-4 min-h-[220px] resize-y text-base leading-relaxed"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder="Collez votre script de vidéo, de pub ou de podcast…"
          aria-label="Texte à lire"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-400">
          <span>{text.length.toLocaleString("fr-CA")} / {MAX_CHARS.toLocaleString("fr-CA")} caractères · aucun crédit consommé</span>
          <label className={`flex items-center gap-3 ${voice.engine !== "kokoro" ? "opacity-40" : ""}`} title={voice.engine !== "kokoro" ? "Vitesse réglable sur les voix anglaises HD" : undefined}>
            Vitesse
            <input type="range" min={0.7} max={1.4} step={0.05} value={speed} disabled={voice.engine !== "kokoro"} onChange={(e) => setSpeed(Number(e.target.value))} className="accent-brand-500" />
            <span className="w-10 tabular-nums">{speed.toFixed(2)}×</span>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={() => generate()} disabled={busy || !text.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? "Génération…" : `Générer avec ${voice.name}`}
          </button>
          <audio ref={audioRef} controls className="h-10 min-w-0 flex-1" />
        </div>

        {progress && (
          <div className="mt-4" role="status">
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>{progress.label}</span>
              <span>{Math.round(progress.ratio * 100)} %</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-brand-500 to-glow-500 transition-all" style={{ width: `${Math.max(4, progress.ratio * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Premier usage : le modèle (25 à 90 Mo) est téléchargé une seule fois, puis mis en cache.</p>
          </div>
        )}
        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Historique de la session</h2>
          {takes.length === 0 ? (
            <p className="text-sm text-zinc-500">Vos prises apparaîtront ici, prêtes à télécharger en WAV.</p>
          ) : (
            <ul className="space-y-2">
              {takes.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-950 p-3 text-sm">
                  <button
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300 hover:bg-brand-500/30"
                    onClick={() => { if (audioRef.current) { audioRef.current.src = t.url; audioRef.current.play(); } }}
                    aria-label="Réécouter"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-zinc-200">{t.text}</p>
                    <p className="text-xs text-zinc-500">{t.voice.name} · {t.seconds.toFixed(1)} s d&apos;audio · généré en {(t.ms / 1000).toFixed(1)} s</p>
                  </div>
                  <a href={t.url} download={`voixxp-${t.voice.name.toLowerCase()}-${t.id}.wav`} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Télécharger en WAV">
                    <Download className="h-4 w-4" />
                  </a>
                  <button className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300" aria-label="Supprimer" onClick={() => { URL.revokeObjectURL(t.url); setTakes((xs) => xs.filter((x) => x.id !== t.id)); }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="card p-5">
        <h2 className="font-semibold">Bibliothèque de voix</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(LANGS) as Voice["lang"][]).map((l) => (
            <button key={l} className={`chip ${lang === l ? "chip-on" : ""}`} onClick={() => pickLang(l)}>{LANGS[l]}</button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {([["all", "Toutes"], ["F", "Féminines"], ["M", "Masculines"]] as const).map(([g, label]) => (
            <button key={g} className={`chip ${gender === g ? "chip-on" : ""}`} onClick={() => setGender(g)}>{label}</button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {list.map((v) => (
            <li key={v.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setVoiceId(v.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setVoiceId(v.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition ${v.id === voiceId ? "border-brand-400 bg-brand-500/10" : "border-white/5 bg-ink-950 hover:border-white/20"}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${v.gender === "F" ? "bg-glow-500/20 text-glow-400" : "bg-brand-500/20 text-brand-300"}`}>{v.name[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium">
                    {v.name}
                    {v.engine === "kokoro" && <span className="rounded bg-amber-400/15 px-1.5 text-[10px] font-semibold text-amber-300">HD</span>}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">{v.style} · {v.accent}</span>
                </span>
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-40"
                  aria-label={`Écouter un extrait de ${v.name}`}
                  disabled={busy}
                  onClick={(e) => { e.stopPropagation(); setVoiceId(v.id); generate(v, SAMPLE_TEXT[v.lang]); }}
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {list.length === 0 && <li className="text-sm text-zinc-500">Aucune voix pour ce filtre.</li>}
        </ul>

        <a href="/clonage" className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-brand-400/40 p-4 text-sm hover:bg-brand-500/5">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-300" />
          <span><span className="font-semibold text-white">Votre propre voix ?</span> Clonez-la à partir de 10 secondes d&apos;audio (forfait Créateur).</span>
        </a>
      </aside>
    </div>
  );
}
