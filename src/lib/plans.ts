// Forfaits payants, compte Stripe « VoixXP » (organisation Omerta Corp). Prix en cents CAD.
// `founder` = prix fondateur garanti a vie. `price` = prix Stripe en MODE REEL (surcharge possible via
// STRIPE_PRICE_CREATEUR / STRIPE_PRICE_STUDIO, par ex. pour un environnement de test).
export const PAID_PLANS = {
  createur: { regular: 1200, founder: 600, price: "price_1UQKMKEDP3BoUiHrhW3lz7J0" },
  studio: { regular: 3900, founder: 1900, price: "price_1UQKMMEDP3BoUiHrrIRHKwpm" },
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
