import { NextResponse } from "next/server";

const PLANS = new Set(["createur", "studio", "agence", "clonage"]);

// Liste d'attente. Si Supabase est configure, la demande est enregistree dans la table `voixxp_waitlist` ;
// sinon elle est journalisee (visible dans les journaux d'execution Vercel).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = typeof body?.plan === "string" && PLANS.has(body.plan) ? body.plan : "createur";
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(email)) {
    return NextResponse.json({ error: "Courriel invalide" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const res = await fetch(`${url}/rest/v1/voixxp_waitlist`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ email, plan }),
    });
    if (!res.ok) {
      console.error("waitlist insert failed", res.status, await res.text());
      return NextResponse.json({ error: "Enregistrement impossible" }, { status: 502 });
    }
  } else {
    console.log("[waitlist]", JSON.stringify({ email, plan, at: new Date().toISOString() }));
  }
  return NextResponse.json({ ok: true });
}
