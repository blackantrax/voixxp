import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyTransaction, webhookHash } from "@/lib/flutterwave";
import { activate } from "@/lib/subscriptions";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Notification Flutterwave apres chaque paiement. Authentifiee par l'en-tete « verif-hash »
// (Flutterwave > Settings > Webhooks > Secret hash), puis re-verifiee aupres de l'API.
export async function POST(req: Request) {
  const expected = webhookHash();
  const received = req.headers.get("verif-hash") ?? "";
  if (!expected || !same(received, expected)) return NextResponse.json({ error: "non autorise" }, { status: 401 });

  const event = await req.json().catch(() => null);
  const id = String(event?.data?.id ?? "");
  const result = await verifyTransaction(id, event?.data?.tx_ref);
  if (result.ok && result.plan) await activate({ ref: event.data.tx_ref, plan: result.plan, amount: result.amount!, currency: result.currency!, email: event?.data?.customer?.email });
  console.log("[flutterwave] webhook", JSON.stringify({ event: event?.event ?? event?.type, id, ...result, at: new Date().toISOString() }));
  // Toujours 200 une fois authentifie : Flutterwave re-essaie sinon.
  return NextResponse.json({ received: true });
}
