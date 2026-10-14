import { NextResponse } from "next/server";
import { createPortal, stripeEnabled } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabase/server";

// Ouvre le portail client Stripe (factures, carte, changement de forfait, resiliation).
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(`${origin}/connexion`, 303);
  const { data: sub } = await supabase
    .from("subscriptions").select("stripe_customer_id").eq("provider", "stripe").not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!stripeEnabled() || !sub?.stripe_customer_id) return NextResponse.redirect(`${origin}/compte`, 303);
  const url = await createPortal(sub.stripe_customer_id, `${origin}/compte`);
  return NextResponse.redirect(url ?? `${origin}/compte`, 303);
}
