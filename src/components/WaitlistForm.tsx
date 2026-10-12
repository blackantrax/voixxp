"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function WaitlistForm({ plan, compact = false }: { plan: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, plan }) }).catch(() => null);
    setState(res?.ok ? "ok" : "err");
  }

  if (state === "ok")
    return <p className="flex items-center gap-2 text-sm text-emerald-300"><Check className="h-4 w-4" /> C&apos;est noté ! On vous écrit dès l&apos;ouverture.</p>;

  return (
    <form onSubmit={submit} className={compact ? "flex flex-col gap-2" : "flex flex-col gap-2 sm:flex-row"}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="field" aria-label="Courriel" />
      <button className="btn-primary shrink-0" disabled={state === "busy"}>
        {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />} Réserver ma place
      </button>
      {state === "err" && <p className="text-xs text-red-300">Oups, réessayez dans un instant.</p>}
    </form>
  );
}
