import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function Conditions() {
  return (
    <LegalPage title="Conditions d'utilisation">
      <p>
        VoixXP (le « Service ») est exploité par {COMPANY} (« nous »), une société constituée en Ontario, Canada. En utilisant
        le Service ou en souscrivant un forfait, vous acceptez les présentes conditions.
      </p>

      <h2>1. Le Service</h2>
      <p>
        VoixXP permet de générer des voix de synthèse à partir d&apos;un texte. La synthèse du forfait Gratuit s&apos;exécute dans
        votre navigateur, à partir de modèles open source. Certaines fonctions (clonage de voix, voix HD hébergées) sont
        réservées aux forfaits payants et peuvent être offertes en accès anticipé.
      </p>

      <h2>2. Compte</h2>
      <p>
        La connexion se fait par lien envoyé à votre courriel. Vous êtes responsable de l&apos;accès à cette adresse. Vous devez
        avoir l&apos;âge de la majorité dans votre province ou pays, ou l&apos;autorisation d&apos;un parent ou tuteur.
      </p>

      <h2>3. Forfaits et paiement</h2>
      <ul>
        <li>Les prix sont affichés en dollars canadiens (carte, via Stripe) ou en francs CFA (Mobile Money, via Flutterwave), taxes en sus le cas échéant.</li>
        <li>Paiement par carte : abonnement mensuel renouvelé automatiquement jusqu&apos;à résiliation.</li>
        <li>Paiement Mobile Money : accès de 30 jours, sans renouvellement automatique.</li>
        <li>Le « prix fondateur » reste garanti tant que l&apos;abonnement demeure actif sans interruption.</li>
        <li>Nous ne conservons jamais vos numéros de carte : ils sont traités directement par Stripe.</li>
      </ul>

      <h2>4. Résiliation</h2>
      <p>
        Vous pouvez résilier en tout temps en nous écrivant ; l&apos;accès reste actif jusqu&apos;à la fin de la période payée. Les
        remboursements sont régis par notre <Link className="text-brand-300 underline" href="/remboursement">politique de remboursement</Link>.
      </p>

      <h2>5. Usage acceptable et clonage de voix</h2>
      <p>Il est interdit d&apos;utiliser le Service pour :</p>
      <ul>
        <li>cloner ou imiter la voix d&apos;une personne sans son consentement explicite et vérifiable ;</li>
        <li>usurper l&apos;identité d&apos;une personne, frauder, harceler, diffamer ou tromper le public ;</li>
        <li>produire des contenus illégaux, haineux, sexuels impliquant des mineurs, ou de la désinformation électorale ;</li>
        <li>contourner les limites techniques du Service ou en revendre l&apos;accès sans autorisation.</li>
      </ul>
      <p>
        Nous pouvons suspendre sans préavis un compte qui enfreint ces règles et collaborer avec les autorités compétentes.
      </p>

      <h2>6. Contenus générés</h2>
      <p>
        Vous conservez les droits sur les textes que vous fournissez et sur les fichiers audio générés, sous réserve des licences
        des modèles de voix utilisés. Vous êtes seul responsable de l&apos;usage que vous en faites. Les forfaits payants incluent
        une licence d&apos;usage commercial pour les voix qui le permettent.
      </p>

      <h2>7. Disponibilité et garanties</h2>
      <p>
        Le Service est fourni « tel quel ». Nous faisons de notre mieux pour qu&apos;il soit disponible et fiable, sans garantir
        un fonctionnement ininterrompu ni l&apos;absence d&apos;erreurs. Dans la mesure permise par la loi, notre responsabilité
        totale est limitée aux montants que vous nous avez versés au cours des 12 derniers mois.
      </p>

      <h2>8. Modifications</h2>
      <p>
        Nous pouvons modifier ces conditions ; la date de mise à jour figure en haut de la page. En cas de changement important,
        nous vous préviendrons par courriel au moins 15 jours à l&apos;avance.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes conditions sont régies par les lois de l&apos;Ontario et les lois fédérales du Canada qui s&apos;y appliquent.
        Les droits que vous accorde la loi de protection du consommateur de votre lieu de résidence demeurent applicables.
      </p>
    </LegalPage>
  );
}
