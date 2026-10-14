import { NextResponse } from "next/server";
import { getSubscription, syncSubscription, verifyWebhook, type StripeSubscription } from "@/lib/stripe";

// Evenements a cocher dans Stripe : checkout.session.completed, invoice.paid, invoice.payment_failed,
// customer.subscription.updated, customer.subscription.deleted.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await req.text();
  if (!secret || !verifyWebhook(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const subId = obj.subscription as string | null;
      const sub = subId ? await getSubscription(subId) : null;
      if (sub) {
        const details = obj.customer_details as { email?: string } | null;
        await syncSubscription(sub, { email: details?.email, userId: obj.client_reference_id as string | null });
      }
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subId =
        (obj.subscription as string | null) ??
        ((obj.parent as { subscription_details?: { subscription?: string } } | null)?.subscription_details?.subscription ?? null);
      const sub = subId ? await getSubscription(subId) : null;
      if (sub) await syncSubscription(sub, { email: obj.customer_email as string | null });
      if (event.type === "invoice.payment_failed") console.warn("[stripe] paiement echoue", subId, obj.customer_email);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(obj as unknown as StripeSubscription);
      break;
  }
  console.log("[stripe] webhook", event.type);
  return NextResponse.json({ received: true });
}
