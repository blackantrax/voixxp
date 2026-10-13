"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2, PartyPopper, Smartphone } from "lucide-react";

const POLL_MS = 4000;
const TIMEOUT_MS = 5 * 60 * 1000;

export function PaymentWaiter({ reference }: { reference: string }) {
  const [state, setState] = useState<"pending" | "successful" | "failed" | "timeout">("pending");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!reference) { setState("failed"); return; }
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const r = await fetch(`/api/flutterwave/statut?ref=${encodeURIComponent(reference)}`).then((x) => x.json()).catch(() => null);
      if (r?.status === "successful") { setAmount(r.amount ?? null); setState("successful"); return; }
      if (r?.status === "failed") { setState("failed"); return; }
      if (Date.now() - started > TIMEOUT_MS) { setState("timeout"); return; }
      timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => clearTimeout(timer);
  }, [reference]);

  if (state === "successful")
    return (
      <>
        <PartyPopper className="mx-auto h-12 w-12 text-brand-300" />
        <h1 className="mt-6 text-3xl font-bold">Paiement reçu, merci !</h1>
        <p className="mt-4 text-zinc-400">
          {amount ? `${amount.toLocaleString("fr-FR")} FCFA reçus. ` : ""}Votre forfait est actif pour 1 mois : retrouvez-le dans « Mon compte » avec le courriel indiqué au paiement.
        </p>
        <div className="mt-8 flex justify-center gap-3"><Link href="/compte" className="btn-primary">Mon compte</Link><Link href="/studio" className="btn-ghost">Ouvrir le studio</Link></div>
      </>
    );

  if (state === "failed" || state === "timeout")
    return (
      <>
        <CircleAlert className="mx-auto h-12 w-12 text-amber-300" />
        <h1 className="mt-6 text-3xl font-bold">{state === "timeout" ? "Délai dépassé" : "Paiement non confirmé"}</h1>
        <p className="mt-4 text-zinc-400">
          Le paiement n&apos;a pas été validé. Si vous avez été débité, écrivez-nous à bonjour@voixxp.com avec votre numéro.
        </p>
        <Link href="/#tarifs" className="btn-primary mt-8">Réessayer</Link>
      </>
    );

  return (
    <>
      <Smartphone className="mx-auto h-12 w-12 text-brand-300" />
      <h1 className="mt-6 text-3xl font-bold">Validez sur votre téléphone</h1>
      <p className="mt-4 text-zinc-400">
        Une demande de paiement a été envoyée sur votre numéro Orange Money ou MTN MoMo. Composez votre code secret
        pour confirmer. Si rien n&apos;arrive, ouvrez votre menu Orange Money (<strong className="text-zinc-200">#150#</strong>) ou MTN MoMo (<strong className="text-zinc-200">*126#</strong>) pour approuver le paiement en attente.
      </p>
      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> En attente de votre confirmation…
      </p>
    </>
  );
}
