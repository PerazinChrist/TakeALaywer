"use client";

import { useState } from "react";
import { Modal } from "@/components/avocats/admin/admin-ui";
import { buttonStyles } from "@/components/ui/button";
import { BookingForm, type BookingContact } from "@/components/avocats/vitrine/booking-form";
import type { Prestation } from "@/lib/data/lawyer-profile";

/** Ce que la vitrine sait du visiteur, transmis depuis le rendu serveur. */
export type BookingSession = {
  signedIn: boolean;
  contact: BookingContact | null;
};

/**
 * Bouton « Réserver » d'une carte de prestation.
 *
 * La demande se remplit dans une boîte de dialogue plutôt que sur une page :
 * on réserve depuis une grille de quatre prestations qu'on est en train de
 * comparer, et quitter la vitrine pour un formulaire ferait perdre cette
 * comparaison. La prise de rendez-vous générale, elle, a bien sa page — voir
 * `/avocats/{slug}/rendez-vous`.
 */
export function ReserveButton({
  prestation,
  lawyerSlug,
  lawyerName,
  session,
}: {
  prestation: Prestation;
  lawyerSlug: string;
  lawyerName: string;
  session: BookingSession;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonStyles({
          size: "sm",
          variant: "outline",
          className: "border-marine-950/15 group-hover:border-gold-500",
        })}
      >
        Réserver
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={prestation.title}
        description={`Demande de réservation auprès de ${lawyerName}. Aucun paiement n’est engagé à cette étape.`}
      >
        <BookingForm
          lawyerSlug={lawyerSlug}
          lawyerName={lawyerName}
          // Une seule prestation dans la liste : celle qu'on vient de choisir.
          // Proposer les autres ici obligerait à relire la grille qu'on vient
          // de quitter.
          prestations={[prestation]}
          defaultPrestationId={prestation.id}
          contact={session.contact}
          signedIn={session.signedIn}
          compact
        />
      </Modal>
    </>
  );
}
