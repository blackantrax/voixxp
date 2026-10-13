import { NextResponse } from "next/server";
import { createPayment, flutterwaveEnabled } from "@/lib/flutterwave";
import { MOBILE_MONEY, type PaidPlan } from "@/lib/plans";

// Cree un paiement Flutterwave et redirige le client vers la page de paiement hebergee.
export async function POST(req: Request) {
  if (!flutterwaveEnabled()) return NextResponse.json({ error: "Paiement Mobile Money indisponible." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const plan = String(form?.get("plan") ?? "") as PaidPlan;
  const email = String(form?.get("email") ?? "").trim().toLowerCase();
  if (!(plan in MOBILE_MONEY.plans)) return NextResponse.json({ error: "Forfait inconnu." }, { status: 400 });
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(email)) return NextResponse.json({ error: "Courriel invalide." }, { status: 400 });

  const origin = new URL(req.url).origin;
  const { link, error } = await createPayment({ plan, email, origin });
  if (!link) {
    console.error("[flutterwave] creation du paiement refusee", error);
    return NextResponse.json({ error: "Le paiement est momentanément indisponible." }, { status: 502 });
  }
  return NextResponse.redirect(link, 303);
}
