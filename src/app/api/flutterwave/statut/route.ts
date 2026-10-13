import { NextResponse } from "next/server";
import { isTxRef, verifyByReference } from "@/lib/flutterwave";
import { activate } from "@/lib/subscriptions";

// Interroge Flutterwave sur l'etat d'un paiement (utilise par la page d'attente).
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref") ?? "";
  if (!isTxRef(ref)) return NextResponse.json({ error: "reference invalide" }, { status: 400 });
  const r = await verifyByReference(ref);
  if (r.ok && r.plan) await activate({ ref, plan: r.plan, amount: r.amount!, currency: r.currency! });
  const status = r.ok ? "successful" : r.pending ? "pending" : "failed";
  return NextResponse.json({ status, plan: r.plan, amount: r.amount }, { headers: { "Cache-Control": "no-store" } });
}
