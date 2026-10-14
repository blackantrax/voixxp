# VoixXP : consignes pour Claude

Studio de voix IA (Next.js 14, Supabase, Stripe, Flutterwave) d'XP Media Inc. Déploiement : push sur `main`
→ GitHub Actions → Vercel (voir `.github/workflows/deploiement.yml`). Ne jamais coller de secret dans le code
ni dans la conversation : variables Vercel ou secrets GitHub.

## Skills Founder (test d'un business avant de le lancer)

Les 11 skills `founder-*` sont dans `.claude/skills/` (copie vérifiée du dépôt
`Jakeschincariol/founder-skill`, commit `fd9385b`, licence MIT dans `FOUNDER-LICENSE`). Ils se chargent tout
seuls dans Claude Code pour ce dépôt.

Quand les utiliser : nouvelle offre, nouveau forfait, changement de prix, nouveau marché (ex. Afrique
centrale en Mobile Money), ou nouveau produit de la famille XP. Ordre conseillé :
board → competitors → consumer → pricing → offer → cfo → marketing → brand → ops → launch → plan.
Idée à peine esquissée : `founder-consumer --quick` (20 acheteurs) pour savoir si elle vaut d'être creusée.

Règles :
- Les résultats vont dans `founder/` à la racine du dépôt (outils Python 3.8+, bibliothèque standard).
- Les 100 acheteurs sont simulés : le taux d'achat est un **maximum**, à confirmer avec de vrais clients
  (liste d'attente, prévente). Ne jamais publier leurs réponses comme des témoignages.
- Chiffres CFO = hypothèses : vrais devis, et validation de la structure, des taxes (TPS/TVH) et des impôts
  par un comptable. Ni conseil financier, ni juridique, ni fiscal.
- Le « board » applique des méthodes publiées (Hormozi, Thiel, Jobs) ; ces personnes ne cautionnent rien.
- Mise à jour du pack : relire le diff du dépôt amont (instructions et scripts) avant de remplacer la copie.
