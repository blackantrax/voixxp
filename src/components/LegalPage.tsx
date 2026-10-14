export const LEGAL_UPDATED = "14 octobre 2026";
export const COMPANY = "XP Media Inc.";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-zinc-300 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:mt-1.5 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-sm text-zinc-500">Dernière mise à jour : {LEGAL_UPDATED}</p>
      {children}
      <h2>Nous joindre</h2>
      <p>
        {COMPANY}, Ontario, Canada. Courriel : <a className="text-brand-300 underline" href="mailto:bonjour@voixxp.com">bonjour@voixxp.com</a>.
      </p>
    </article>
  );
}
