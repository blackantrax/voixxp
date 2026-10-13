import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function Connexion({ searchParams }: { searchParams: { erreur?: string } }) {
  const { data } = await supabaseServer().auth.getUser();
  if (data.user) redirect("/compte");
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Connexion à VoixXP</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sans mot de passe : entrez votre courriel, nous vous envoyons un lien de connexion. Utilisez le même courriel
          que lors de votre paiement pour retrouver votre forfait.
        </p>
        {searchParams.erreur && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.</p>}
        <div className="mt-6"><LoginForm /></div>
      </div>
    </div>
  );
}
