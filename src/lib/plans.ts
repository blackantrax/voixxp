// Forfaits payants : liens de paiement Stripe heberges (aucune cle secrete cote site).
// Prix en cents CAD. `founder` = prix fondateur garanti a vie pour les premiers membres.
// MODE TEST : remplacer `link` par les liens du mode reel avant le lancement public.
export const PAID_PLANS = {
  createur: { regular: 1200, founder: 600, link: "https://buy.stripe.com/test_fZu6oG0S4fg94ve47T7Zu00" },
  studio: { regular: 3900, founder: 1900, link: "https://buy.stripe.com/test_fZufZgcAMgkd3raawh7Zu01" },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;

export const dollars = (cents: number) => `${(cents / 100).toLocaleString("fr-CA")} $`;

// Paiement Mobile Money / carte via Flutterwave (Afrique centrale, francs CFA). Montants en XAF.
// Paiement pour 1 mois (pas encore de prelevement recurrent).
export const MOBILE_MONEY = {
  currency: "XAF",
  plans: { createur: 2000, studio: 6000 } satisfies Record<PaidPlan, number>,
} as const;

export const fcfa = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
