"use server";

import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

export async function sendMagicLink(_: unknown, form: FormData): Promise<{ ok: boolean; message: string }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(email)) return { ok: false, message: "Courriel invalide." };
  const h = headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const { error } = await supabaseServer().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    console.error("[auth] lien magique", error.message);
    return { ok: false, message: "Envoi impossible pour le moment. Réessayez dans quelques minutes." };
  }
  return { ok: true, message: `Lien de connexion envoyé à ${email}. Ouvrez-le sur cet appareil.` };
}
