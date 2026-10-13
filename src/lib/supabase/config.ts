// Adresse et cle publiable du projet Supabase « voixxp ». La cle publiable est faite pour le
// navigateur (les regles RLS protegent les donnees) ; la cle secrete reste cote serveur.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wtrwajlwiacwtnwbiteq.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_V04StNnzXQo9LiMdx62z0A_Md-WpGWe";
