import type { Metadata } from "next";
import { COMPANY, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        {COMPANY} respecte votre vie privée et applique la Loi sur la protection des renseignements personnels et les documents
        électroniques (LPRPDE). Cette politique explique ce que nous recueillons, pourquoi, et vos droits.
      </p>

      <h2>Ce qui reste sur votre appareil</h2>
      <p>
        Les textes saisis dans le studio et les voix générées par le forfait Gratuit sont traités entièrement dans votre
        navigateur : ils ne nous sont jamais transmis. Les modèles de voix sont téléchargés depuis Hugging Face et conservés dans
        le stockage local de votre navigateur.
      </p>

      <h2>Ce que nous recueillons</h2>
      <ul>
        <li><strong>Compte :</strong> votre adresse courriel.</li>
        <li><strong>Paiements :</strong> forfait, montant, devise, date, référence de transaction, et votre numéro de téléphone pour le Mobile Money. Les données de carte sont traitées par Stripe et ne nous parviennent jamais.</li>
        <li><strong>Liste d&apos;attente :</strong> votre courriel et le forfait qui vous intéresse.</li>
        <li><strong>Clonage de voix (lorsqu&apos;il sera ouvert) :</strong> l&apos;échantillon audio que vous fournissez, utilisé uniquement pour générer votre voix et supprimable sur demande.</li>
        <li><strong>Journaux techniques :</strong> données minimales de fonctionnement (adresse IP, erreurs) conservées par notre hébergeur pour la sécurité.</li>
      </ul>

      <h2>Pourquoi</h2>
      <p>
        Pour vous donner accès à votre forfait, traiter vos paiements, vous envoyer les liens de connexion et les reçus,
        prévenir la fraude et respecter nos obligations légales. Nous ne vendons pas vos renseignements et n&apos;utilisons pas
        vos échantillons de voix pour entraîner des modèles.
      </p>

      <h2>Nos fournisseurs</h2>
      <ul>
        <li>Supabase (base de données et connexion, hébergée au Canada — région de Montréal) ;</li>
        <li>Vercel (hébergement du site) ;</li>
        <li>Stripe (paiements par carte) et Flutterwave (paiements Mobile Money) ;</li>
        <li>Hugging Face (téléchargement des modèles de voix open source).</li>
      </ul>
      <p>Certains de ces fournisseurs peuvent traiter des données hors du Canada, sous des protections contractuelles.</p>

      <h2>Témoins (cookies)</h2>
      <p>Nous utilisons uniquement les témoins nécessaires à votre connexion. Aucun témoin publicitaire.</p>

      <h2>Conservation</h2>
      <p>
        Les renseignements de compte sont conservés tant que votre compte est actif. Les données de paiement sont conservées
        le temps exigé par les lois fiscales (jusqu&apos;à 7 ans). Vous pouvez demander la suppression de votre compte en tout temps.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès à vos renseignements, leur correction ou leur suppression en écrivant à
        bonjour@voixxp.com. Nous répondons dans un délai de 30 jours. Vous pouvez aussi vous adresser au Commissariat à la
        protection de la vie privée du Canada.
      </p>
    </LegalPage>
  );
}
