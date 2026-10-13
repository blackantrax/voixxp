"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import { sendMagicLink } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Recevoir mon lien de connexion
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(sendMagicLink, null);
  if (state?.ok) return <p className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-300">{state.message}</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="email" name="email" required placeholder="vous@exemple.com" className="field" aria-label="Courriel" />
      <Submit />
      {state && !state.ok && <p className="text-sm text-red-300">{state.message}</p>}
    </form>
  );
}
