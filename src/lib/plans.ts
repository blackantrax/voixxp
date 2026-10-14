// Forfaits payants, compte Stripe « VoixXP » (organisation Omerta Corp). Prix en cents CAD.
// `founder` = prix fondateur garanti a vie. `price` = prix Stripe (Checkout cote serveur) ; `link` = lien
// de paiement de secours si la cle Stripe n'est pas configuree. MODE TEST : remplacer par le mode reel
// via STRIPE_PRICE_CREATEUR / STRIPE_PRICE_STUDIO au lancement.
export const PAID_PLANS = {
  createur: { regular: 1200, founder: 600, price: "price_1UQGA1EDP3BoUiHrP80lAFjV", link: "https://buy.stripe.com/test_5kQ7sLd5sdvj5TqcxQ2ZO00" },
  studio: { regular: 3900, founder: 1900, price: "price_1UQGA4EDP3BoUiHrKZzUQ6Ia", link: "https://buy.stripe.com/test_aFabJ19Tgcrffu01Tc2ZO01" },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;

export const dollars = (cents: number) => `${(cents / 100).toLocaleString("fr-CA")} $`;

// Paiement Mobile Money / carte via Flutterwave (Afrique centrale, francs CFA). Montants en XAF.
// Paiement pour 1 mois (pas encore de prelevement recurrent).
export const MOBILE_MONEY = {
  currency: "XAF",
  country: "CM",
  plans: { createur: 2000, studio: 6000 } satisfies Record<PaidPlan, number>,
} as const;

export const fcfa = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
