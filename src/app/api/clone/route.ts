import { NextResponse } from "next/server";

export const maxDuration = 60;

const MAX_AUDIO = 10 * 1024 * 1024;
const MAX_TEXT = 1000;

// Clonage de voix : relaie vers un serveur GPU auto-heberge (ex. Chatterbox, licence MIT).
// Contrat attendu de CLONE_API_URL : POST multipart { text, reference_audio } -> audio/wav.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const text = String(form?.get("text") ?? "").trim();
  const audio = form?.get("reference_audio");
  const consent = form?.get("consent") === "oui";

  if (!consent) return NextResponse.json({ error: "Le consentement de la personne dont la voix est clonée est obligatoire." }, { status: 400 });
  if (!text || text.length > MAX_TEXT) return NextResponse.json({ error: `Texte requis (${MAX_TEXT} caractères max).` }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_AUDIO || !audio.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Échantillon audio requis (10 Mo max)." }, { status: 400 });
  }

  const endpoint = process.env.CLONE_API_URL;
  if (!endpoint) {
    return NextResponse.json({ error: "early_access", message: "Le clonage est en accès anticipé pour les membres Créateur." }, { status: 503 });
  }

  const upstream = new FormData();
  upstream.set("text", text);
  upstream.set("reference_audio", audio, "reference.wav");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: process.env.CLONE_API_KEY ? { Authorization: `Bearer ${process.env.CLONE_API_KEY}` } : undefined,
    body: upstream,
  }).catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: "Le serveur de clonage ne répond pas." }, { status: 502 });

  return new NextResponse(res.body, { headers: { "Content-Type": res.headers.get("Content-Type") ?? "audio/wav", "Cache-Control": "no-store" } });
}
