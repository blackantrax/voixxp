import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Politique de remboursement" };

export default function Remboursement() {
  return (
    <LegalPage title="Politique de remboursement">
      <h2>Garantie de 14 jours</h2>
      <p>
        Si VoixXP ne vous convient pas, écrivez-nous dans les 14 jours suivant votre premier paiement : nous vous remboursons
        intégralement, sans justification.
      </p>

      <h2>Après 14 jours</h2>
      <ul>
        <li>Abonnement par carte : vous pouvez résilier en tout temps ; la résiliation prend effet à la fin du mois payé, sans remboursement au prorata.</li>
        <li>Mobile Money : l&apos;accès de 30 jours n&apos;est pas renouvelé automatiquement ; aucun prélèvement ultérieur n&apos;a lieu.</li>
      </ul>

      <h2>Fonctions en accès anticipé</h2>
      <p>
        Si une fonction annoncée dans votre forfait (par exemple le clonage de voix) n&apos;est pas encore disponible, vous pouvez
        demander le remboursement des mois concernés à tout moment.
      </p>

      <h2>Comment demander un remboursement</h2>
      <p>
        Écrivez à bonjour@voixxp.com depuis le courriel de votre compte, en indiquant la date du paiement. Le remboursement
        est effectué sur le moyen de paiement d&apos;origine (carte ou compte Mobile Money) sous 5 à 10 jours ouvrables.
      </p>
    </LegalPage>
  );
}
