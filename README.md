# VoixXP

Studio de voix IA pour créateurs de contenu — alternative open source et abordable à ElevenLabs.
Produit de la famille XP (avec AdminXP).

## Comment ça marche

| Fonction | Moteur | Où ça tourne | Licence |
| --- | --- | --- | --- |
| Voix anglaises HD | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via `kokoro-js` | Navigateur (WebGPU ou WASM) | Apache 2.0 |
| Voix françaises + 30 langues | [Piper](https://github.com/rhasspy/piper) via `@mintplex-labs/piper-tts-web` | Navigateur (WASM) | MIT (modèles : voir chaque carte) |
| Clonage de voix | [Chatterbox](https://github.com/resemble-ai/chatterbox) (à brancher) | Serveur GPU auto-hébergé | MIT |

La synthèse gratuite ne coûte rien en serveur : les modèles (25 à 90 Mo) sont téléchargés depuis
Hugging Face par le navigateur, une seule fois, puis mis en cache. Le texte ne quitte jamais l'appareil.

`scripts/build-workers.mjs` prépare les Web Workers dans `public/workers/` avant chaque `dev`/`build`.

## Développement

```bash
npm install
npm run dev
```

## Variables d'environnement (toutes optionnelles)

| Variable | Rôle |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Enregistre la liste d'attente dans la table `voixxp_waitlist (email text unique, plan text, created_at timestamptz default now())`. Sans elles, les inscriptions sont écrites dans les journaux Vercel. |
| `FAL_KEY` | Clonage de voix (Chatterbox multilingue sur les GPU de fal.ai, 0,025 $ US / 1 000 caractères). Quotas : essai 300 caractères, Créateur 100 000/mois, Studio 500 000/mois (table `clone_usage`). Sans elle, `/clonage` affiche l'accès anticipé. |

## Licences des voix

Avant la mise en marché payante, vérifier la licence de chaque voix Piper (certains jeux de données
sont non commerciaux) et ne proposer en forfait payant que les voix à licence compatible.

## Paiements Mobile Money (Flutterwave, API v3)

Variables Vercel (Production et Preview), valeurs jamais dans le code :

| Variable | Rôle |
| --- | --- |
| `FLUTTERWAVE_SECRET_KEY` | Clé secrète v3 (`FLWSECK_TEST-…` en test). Active l'option Mobile Money sur la page des tarifs. |
| `FLUTTERWAVE_V3_WEBHOOK_HASH` | « Secret hash » saisi dans Flutterwave > Settings > Webhooks (repli : `FLUTTERWAVE_WEBHOOK_SECRET_HASH`). |
| `FLUTTERWAVE_V3_API_BASE_URL` | Optionnel, défaut `https://api.flutterwave.com/v3`. (`FLUTTERWAVE_API_BASE_URL` désigne le bac à sable v4 et n'est pas utilisé.) |

URL du webhook à déclarer chez Flutterwave : `https://www.voixxp.com/api/flutterwave/webhook`.
Les prix en XAF sont dans `src/lib/plans.ts` (`MOBILE_MONEY`). Chaque paiement est re-vérifié auprès
de l'API (statut, référence, montant, devise) au retour sur `/merci` et à la réception du webhook.

## Paiements par carte (Stripe Billing)

Compte Stripe « VoixXP » (organisation Omerta Corp). Plan d'intégration Stripe : Checkout hébergé en mode
abonnement, portail client, webhooks, Smart Retries, surveillance des seuils de taxes.

| Variable Vercel | Rôle |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clé restreinte : écriture Checkout Sessions et Customer portal ; lecture Subscriptions, Customers, Invoices, Prices. Sans elle, repli sur les liens de paiement. |
| `STRIPE_WEBHOOK_SECRET` | Secret `whsec_…` de la destination « VoixXP site ». |
| `STRIPE_PRICE_CREATEUR`, `STRIPE_PRICE_STUDIO` | Prix du mode réel (sinon prix de test de `src/lib/plans.ts`). |

- Webhook : `https://www.voixxp.com/api/stripe/webhook`, événements `checkout.session.completed`,
  `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- Portail client : configuration `VoixXP` par défaut (factures, carte, changement de forfait, résiliation
  en fin de période), retour vers `/compte`.
- Passage en réel : recréer produits, prix et portail dans le mode réel du compte VoixXP, renseigner
  les variables ci-dessus avec les valeurs réelles, et une nouvelle destination webhook en mode réel.
