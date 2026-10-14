import "server-only";
import { fal } from "@fal-ai/client";
import { supabaseAdmin } from "./supabase/admin";

// Clonage de voix sur GPU via fal.ai : Chatterbox multilingue (Resemble AI, licence MIT), 23 langues.
// Cle FAL_KEY (variable Vercel). Cout indicatif : 0,025 $ US / 1 000 caracteres.
const MODEL = "fal-ai/chatterbox/text-to-speech/multilingual";
const CHUNK = 280; // le modele accepte 300 caracteres par appel

export const CLONE_LANGS = {
  french: "Français", english: "Anglais", spanish: "Espagnol", german: "Allemand",
  italian: "Italien", portuguese: "Portugais", dutch: "Néerlandais",
} as const;
export type CloneLang = keyof typeof CLONE_LANGS;

// Caracteres par mois (environ 900 caracteres par minute d'audio) ; essai gratuit : une fois, a vie.
export const QUOTAS = { essai: 300, createur: 100_000, studio: 500_000 } as const;
export type ClonePlan = keyof typeof QUOTAS;

export const cloneEnabled = () => Boolean(process.env.FAL_KEY);

// Forfait du visiteur (abonnement actif rattache a son compte ou a son courriel) et caracteres restants.
export async function cloneAllowance(userId: string, email?: string | null) {
  const db = supabaseAdmin();
  if (!db) return null;
  const now = new Date();
  const active = () => db.from("subscriptions").select("plan").eq("status", "active").gt("current_period_end", now.toISOString());
  const [byUser, byEmail] = await Promise.all([
    active().eq("user_id", userId),
    email ? active().eq("email", email.toLowerCase()) : Promise.resolve({ data: [] as { plan: string }[] }),
  ]);
  const plans = [...(byUser.data ?? []), ...(byEmail.data ?? [])].map((s) => s.plan);
  const plan: ClonePlan = plans.includes("studio") ? "studio" : plans.includes("createur") ? "createur" : "essai";

  const since = plan === "essai" ? new Date(0) : new Date(now.getFullYear(), now.getMonth(), 1);
  const { data: rows } = await db.from("clone_usage").select("chars").eq("user_id", userId).gte("created_at", since.toISOString());
  const used = (rows ?? []).reduce((n, r) => n + r.chars, 0);
  return { plan, used, quota: QUOTAS[plan], remaining: Math.max(0, QUOTAS[plan] - used) };
}

export async function recordUsage(o: { userId: string; plan: ClonePlan; chars: number; ip?: string | null }) {
  const { error } = await supabaseAdmin()!.from("clone_usage").insert({ user_id: o.userId, plan: o.plan, chars: o.chars, ip: o.ip ?? null });
  if (error) console.error("[clonage] usage", error.message);
}

// Decoupe aux fins de phrase (puis aux virgules, puis aux espaces) pour rester sous la limite du modele.
export function chunkText(text: string, max = CHUNK) {
  const out: string[] = [];
  let rest = text.replace(/\s+/g, " ").trim();
  while (rest.length > max) {
    const slice = rest.slice(0, max);
    const cut = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    const at = cut > max / 3 ? cut + 1 : slice.lastIndexOf(", ") > max / 3 ? slice.lastIndexOf(", ") + 1 : slice.lastIndexOf(" ");
    const end = at > 0 ? at : max;
    out.push(rest.slice(0, end).trim());
    rest = rest.slice(end).trim();
  }
  if (rest) out.push(rest);
  return out;
}

// Assemble des WAV PCM de meme format : en-tete du premier, donnees de tous.
export function concatWav(parts: ArrayBuffer[]) {
  const dataOf = (buf: ArrayBuffer) => {
    const v = new DataView(buf);
    let p = 12;
    while (p + 8 <= buf.byteLength) {
      const id = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3));
      const size = v.getUint32(p + 4, true);
      if (id === "data") return { header: new Uint8Array(buf, 0, p + 8), data: new Uint8Array(buf, p + 8, Math.min(size, buf.byteLength - p - 8)) };
      p += 8 + size + (size % 2);
    }
    throw new Error("WAV sans bloc de donnees");
  };
  const chunks = parts.map(dataOf);
  const total = chunks.reduce((n, c) => n + c.data.length, 0);
  const head = chunks[0].header;
  const out = new Uint8Array(head.length + total);
  out.set(head, 0);
  let off = head.length;
  for (const c of chunks) { out.set(c.data, off); off += c.data.length; }
  const v = new DataView(out.buffer);
  v.setUint32(4, out.length - 8, true);
  v.setUint32(head.length - 4, total, true);
  return out;
}

export async function cloneSpeech(o: { text: string; sample: Blob; sampleLang: CloneLang; lang: CloneLang }) {
  fal.config({ credentials: process.env.FAL_KEY });
  const voiceUrl = await fal.storage.upload(o.sample);
  // Langue de sortie differente de l'echantillon : cfg 0 limite l'accent herite.
  const cfg = o.lang === o.sampleLang ? 0.5 : 0;
  const wavs = await Promise.all(
    chunkText(o.text).map(async (text) => {
      const { data } = await fal.subscribe(MODEL, {
        input: { text, voice: voiceUrl, custom_audio_language: o.sampleLang, cfg_scale: cfg, exaggeration: 0.5, temperature: 0.8 },
      });
      const url = (data as { audio?: { url?: string } }).audio?.url;
      if (!url) throw new Error("Reponse du modele sans audio");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Telechargement audio ${res.status}`);
      return res.arrayBuffer();
    }),
  );
  return concatWav(wavs);
}
