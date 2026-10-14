"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, Upload } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

const LANGS = { french: "Français", english: "Anglais", spanish: "Espagnol", german: "Allemand", italian: "Italien", portuguese: "Portugais", dutch: "Néerlandais" };
const PLAN_LABEL: Record<string, string> = { essai: "Essai gratuit", createur: "Forfait Créateur", studio: "Forfait Studio" };
type Allowance = { enabled: boolean; signedIn?: boolean; plan?: string; remaining?: number; quota?: number };

export function CloneForm() {
  const [file, setFile] = useState<Blob | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("Salut, c'est moi ! Cette voix a été clonée avec VoixXP en quelques secondes.");
  const [consent, setConsent] = useState(false);
  const [lang, setLang] = useState("french");
  const [sampleLang, setSampleLang] = useState("french");
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "early" | "login" | "quota" | "err">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    fetch("/api/clone").then((r) => r.json()).then(setAllowance).catch(() => {});
  }, []);

  function setSample(b: Blob) {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(b);
    setFileUrl(URL.createObjectURL(b));
  }

  async function toggleRecord() {
    if (recording) { recorder.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setSample(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        setRecording(false);
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setState("err");
      setMessage("Micro inaccessible. Autorisez-le dans le navigateur ou téléversez un fichier.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setState("busy");
    const fd = new FormData();
    fd.set("text", text);
    fd.set("reference_audio", file);
    fd.set("consent", consent ? "oui" : "non");
    fd.set("lang", lang);
    fd.set("sample_lang", sampleLang);
    const res = await fetch("/api/clone", { method: "POST", body: fd }).catch(() => null);
    if (res?.ok) {
      const left = Number(res.headers.get("X-Clone-Remaining"));
      if (allowance && Number.isFinite(left)) setAllowance({ ...allowance, remaining: left });
      setResult(URL.createObjectURL(await res.blob()));
      setState("idle");
      return;
    }
    const data = await res?.json().catch(() => null);
    if (data?.error === "early_access") { setState("early"); return; }
    if (data?.error === "login" || data?.error === "quota") { setState(data.error); setMessage(data.message); return; }
    setState("err");
    setMessage(data?.error ?? "Erreur réseau.");
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div>
        <p className="mb-2 text-sm font-semibold">1. Échantillon de voix (10 à 30 secondes, sans musique)</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={toggleRecord} className={recording ? "btn bg-red-500 text-white" : "btn-ghost"}>
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {recording ? "Arrêter l'enregistrement" : "Enregistrer ma voix"}
          </button>
          <label className="btn-ghost cursor-pointer">
            <Upload className="h-4 w-4" /> Téléverser un fichier
            <input type="file" accept="audio/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setSample(e.target.files[0])} />
          </label>
        </div>
        {fileUrl && <audio src={fileUrl} controls className="mt-3 w-full" />}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="clone-text">2. Ce que votre voix doit dire</label>
        <textarea id="clone-text" className="field min-h-[100px]" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          Langue de l&apos;échantillon
          <select className="field mt-1" value={sampleLang} onChange={(e) => setSampleLang(e.target.value)}>
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          Langue du texte à lire
          <select className="field mt-1" value={lang} onChange={(e) => setLang(e.target.value)}>
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-zinc-300">
        <input type="checkbox" className="mt-1 accent-brand-500" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>Je confirme que cette voix est la mienne, ou que j&apos;ai le consentement écrit de la personne. Le clonage de la voix d&apos;autrui sans accord est interdit.</span>
      </label>

      <button className="btn-primary w-full" disabled={!file || !consent || state === "busy"}>
        {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />} Cloner et générer
      </button>

      {allowance?.enabled && allowance.signedIn && allowance.plan && (
        <p className="text-center text-xs text-zinc-400">
          {PLAN_LABEL[allowance.plan]} : {(allowance.remaining ?? 0).toLocaleString("fr-CA")} caractères restants
          {allowance.plan === "essai" ? " (essai unique)" : " ce mois-ci"}.
        </p>
      )}
      {allowance?.enabled && allowance.signedIn === false && (
        <p className="text-center text-xs text-zinc-400"><a href="/connexion" className="underline">Connectez-vous</a> pour essayer gratuitement ({300} caractères offerts).</p>
      )}

      {result && (
        <div className="space-y-2">
          <audio src={result} controls autoPlay className="w-full" />
          <a href={result} download="voixxp-clone.wav" className="btn-ghost w-full">Télécharger en WAV</a>
        </div>
      )}
      {(state === "login" || state === "quota") && (
        <div className="space-y-3 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4 text-sm">
          <p>{message}</p>
          <a href={state === "login" ? "/connexion" : "/#tarifs"} className="btn-primary w-full">{state === "login" ? "Me connecter" : "Voir les forfaits"}</a>
        </div>
      )}
      {state === "err" && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{message}</p>}
      {state === "early" && (
        <div className="space-y-3 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
          <p className="text-sm">
            <span className="font-semibold">Le clonage est en accès anticipé.</span> Il tourne sur nos serveurs GPU et ouvre d&apos;abord aux membres Créateur.
            Laissez votre courriel pour être parmi les premiers.
          </p>
          <WaitlistForm plan="clonage" />
        </div>
      )}
    </form>
  );
}
