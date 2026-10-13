import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PLANS = new Set(["createur", "studio", "agence", "clonage"]);

// Liste d'attente. Si la cle secrete Supabase est configuree, la demande est enregistree dans la table `waitlist` ;
// sinon elle est journalisee (visible dans les journaux d'execution Vercel).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = typeof body?.plan === "string" && PLANS.has(body.plan) ? body.plan : "createur";
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(email)) {
    return NextResponse.json({ error: "Courriel invalide" }, { status: 400 });
  }

  const db = supabaseAdmin();
  if (db) {
    const { error } = await db.from("waitlist").upsert({ email, plan }, { onConflict: "email,plan", ignoreDuplicates: true });
    if (error) {
      console.error("waitlist insert failed", error.message);
      return NextResponse.json({ error: "Enregistrement impossible" }, { status: 502 });
    }
  } else {
    console.log("[waitlist]", JSON.stringify({ email, plan, at: new Date().toISOString() }));
  }
  return NextResponse.json({ ok: true });
}
