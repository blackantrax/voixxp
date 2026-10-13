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
| `CLONE_API_URL`, `CLONE_API_KEY` | Serveur de clonage. Contrat : `POST` multipart `{ text, reference_audio }` → `audio/wav`. Sans elles, `/clonage` affiche l'accès anticipé. |

## Licences des voix

Avant la mise en marché payante, vérifier la licence de chaque voix Piper (certains jeux de données
sont non commerciaux) et ne proposer en forfait payant que les voix à licence compatible.

## Paiements Mobile Money (Flutterwave, API v3)

Variables Vercel (Production et Preview), valeurs jamais dans le code :

| Variable | Rôle |
| --- | --- |
| `FLUTTERWAVE_SECRET_KEY` | Clé secrète v3 (`FLWSECK_TEST-…` en test). Active l'option Mobile Money sur la page des tarifs. |
| `FLUTTERWAVE_V3_WEBHOOK_HASH` | « Secret hash » saisi dans Flutterwave > Settings > Webhooks (repli : `FLUTTERWAVE_WEBHOOK_SECRET_HASH`). |
| `FLUTTERWAVE_API_BASE_URL` | Optionnel, défaut `https://api.flutterwave.com/v3`. |

URL du webhook à déclarer chez Flutterwave : `https://www.voixxp.com/api/flutterwave/webhook`.
Les prix en XAF sont dans `src/lib/plans.ts` (`MOBILE_MONEY`). Chaque paiement est re-vérifié auprès
de l'API (statut, référence, montant, devise) au retour sur `/merci` et à la réception du webhook.
