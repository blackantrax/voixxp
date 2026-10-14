import { NextResponse } from "next/server";
import { createCheckout, stripeEnabled } from "@/lib/stripe";
import { PAID_PLANS, type PaidPlan } from "@/lib/plans";
import { supabaseServer } from "@/lib/supabase/server";

// Cree une session Checkout (abonnement) ; client connecte : courriel prerempli et compte rattache.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const plan = String(form?.get("plan") ?? "") as PaidPlan;
  if (!(plan in PAID_PLANS)) return NextResponse.json({ error: "Forfait inconnu." }, { status: 400 });
  const indisponible = new URL("/?paiement=indisponible#tarifs", req.url);
  if (!stripeEnabled()) return NextResponse.redirect(indisponible, 303);

  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  let customerId: string | undefined;
  if (data.user) {
    const { data: prev } = await supabase.from("subscriptions").select("stripe_customer_id").not("stripe_customer_id", "is", null).limit(1).maybeSingle();
    customerId = prev?.stripe_customer_id ?? undefined;
  }
  const url = await createCheckout({ plan, origin: new URL(req.url).origin, email: data.user?.email, userId: data.user?.id, customerId });
  return NextResponse.redirect(url ?? indisponible, 303);
}
