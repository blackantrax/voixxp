import { NextResponse } from "next/server";
import { chargeMobileMoney, flutterwaveEnabled } from "@/lib/flutterwave";
import { MOBILE_MONEY, type PaidPlan } from "@/lib/plans";

// Numero camerounais : 9 chiffres commencant par 6, avec ou sans l'indicatif 237.
function normalizeCameroon(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^00/, "");
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  return /^6\d{8}$/.test(local) ? `237${local}` : null;
}

export async function POST(req: Request) {
  if (!flutterwaveEnabled()) return NextResponse.json({ error: "Paiement Mobile Money indisponible." }, { status: 503 });
  const form = await req.formData().catch(() => null);
  const plan = String(form?.get("plan") ?? "") as PaidPlan;
  const phone = normalizeCameroon(String(form?.get("phone") ?? ""));
  const rawEmail = String(form?.get("email") ?? "").trim().toLowerCase();
  if (!(plan in MOBILE_MONEY.plans)) return NextResponse.json({ error: "Forfait inconnu." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Numéro Orange Money ou MTN invalide (ex. 6 77 12 34 56)." }, { status: 400 });
  if (rawEmail && !/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(rawEmail)) return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });
  // Flutterwave exige un courriel : a defaut, adresse technique liee au numero (pour le recu).
  const email = rawEmail || `${phone}@clients.voixxp.com`;

  const origin = new URL(req.url).origin;
  const { txRef, redirect, error } = await chargeMobileMoney({ plan, phone, email, origin });
  if (error) {
    console.error("[flutterwave] prelevement Mobile Money refuse", error);
    return NextResponse.json({ error: "Le paiement Mobile Money est momentanément indisponible." }, { status: 502 });
  }
  return NextResponse.redirect(redirect ?? `${origin}/paiement?ref=${txRef}`, 303);
}
