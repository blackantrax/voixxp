import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Retour du lien magique : echange le code contre une session, puis ouvre l'espace client.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${url.origin}/compte`);
    console.error("[auth] echange du code", error.message);
  }
  return NextResponse.redirect(`${url.origin}/connexion?erreur=lien`);
}
