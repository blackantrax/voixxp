import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { CLONE_LANGS, cloneAllowance, cloneEnabled, cloneSpeech, recordUsage, type CloneLang } from "@/lib/clone";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_AUDIO = 10 * 1024 * 1024;
const MAX_TEXT = 1000;
const isLang = (v: unknown): v is CloneLang => typeof v === "string" && v in CLONE_LANGS;

async function visitor() {
  const { data } = await supabaseServer().auth.getUser();
  return data.user;
}

// Forfait et caracteres restants, pour l'affichage du formulaire.
export async function GET() {
  if (!cloneEnabled()) return NextResponse.json({ enabled: false });
  const user = await visitor();
  if (!user) return NextResponse.json({ enabled: true, signedIn: false });
  return NextResponse.json({ enabled: true, signedIn: true, ...(await cloneAllowance(user.id, user.email)) });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const text = String(form?.get("text") ?? "").replace(/\s+/g, " ").trim();
  const audio = form?.get("reference_audio");
  const consent = form?.get("consent") === "oui";
  const lang = form?.get("lang") ?? "french";
  const sampleLang = form?.get("sample_lang") ?? "french";

  if (!consent) return NextResponse.json({ error: "Le consentement de la personne dont la voix est clonée est obligatoire." }, { status: 400 });
  if (!text || text.length > MAX_TEXT) return NextResponse.json({ error: `Texte requis (${MAX_TEXT} caractères max).` }, { status: 400 });
  if (!isLang(lang) || !isLang(sampleLang)) return NextResponse.json({ error: "Langue non prise en charge." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_AUDIO || !audio.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Échantillon audio requis (10 Mo max)." }, { status: 400 });
  }
  if (!cloneEnabled()) {
    return NextResponse.json({ error: "early_access", message: "Le clonage est en accès anticipé pour les membres Créateur." }, { status: 503 });
  }

  const user = await visitor();
  if (!user) return NextResponse.json({ error: "login", message: "Connectez-vous pour cloner une voix (essai gratuit inclus)." }, { status: 401 });
  const allowance = await cloneAllowance(user.id, user.email);
  if (!allowance) return NextResponse.json({ error: "Service momentanément indisponible." }, { status: 503 });
  if (text.length > allowance.remaining) {
    return NextResponse.json(
      {
        error: "quota",
        message: allowance.plan === "essai"
          ? `Votre essai gratuit permet ${allowance.quota} caractères (il en reste ${allowance.remaining}). Passez au forfait Créateur pour continuer.`
          : `Il vous reste ${allowance.remaining.toLocaleString("fr-CA")} caractères ce mois-ci : raccourcissez le texte ou passez au forfait Studio.`,
        ...allowance,
      },
      { status: 402 },
    );
  }

  try {
    const wav = await cloneSpeech({ text, sample: audio, sampleLang, lang });
    await recordUsage({ userId: user.id, plan: allowance.plan, chars: text.length, ip: req.headers.get("x-forwarded-for")?.split(",")[0] });
    return new NextResponse(wav, {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store", "X-Clone-Remaining": String(allowance.remaining - text.length) },
    });
  } catch (e) {
    console.error("[clonage]", (e as Error).message);
    return NextResponse.json({ error: "La génération a échoué. Réessayez avec un échantillon plus net (10 à 30 secondes, sans musique)." }, { status: 502 });
  }
}
