"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminCard, Feedback } from "@/components/avocats/admin/admin-ui";
import { buttonStyles } from "@/components/ui/button";
import { TextArea } from "@/components/ui/form";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { patchJson } from "@/lib/api/client";
import { cn, formatFcfa } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/api/types";
import {
  IconCalendar,
  IconCheck,
  IconClose,
  IconMail,
  IconMessages,
  IconPhone,
  IconVideo,
} from "@/components/ui/icons";

const modeLabels: Record<string, string> = {
  visio: "Visioconférence",
  cabinet: "Au cabinet",
  telephone: "Par téléphone",
  document: "Sur pièces",
};

const toneStyles: Record<string, string> = {
  warning: "bg-gold-500/12 text-gold-700 ring-gold-500/25",
  success: "bg-trust-500/10 text-trust-600 ring-trust-500/25",
  danger: "bg-danger-50 text-danger-700 ring-danger-200",
  neutral: "bg-marine-950/5 text-marine-600 ring-marine-950/10",
};

/**
 * Agenda du cabinet — réservations de prestations et demandes de rendez-vous.
 *
 * Les deux vivent dans la même liste parce que c'est le même geste côté
 * praticien : lire une demande, la confirmer ou la décliner, avec un mot. Les
 * séparer en deux onglets obligerait à consulter les deux avant de savoir ce
 * qu'il reste à traiter.
 *
 * Les demandes non traitées passent devant, quelle que soit leur date — c'est
 * le backend qui les trie ainsi, et c'est ce que le praticien vient chercher.
 */
export function SectionRendezVous({ initial }: { initial: Booking[] }) {
  const [items, setItems] = useState(initial);

  const pending = items.filter((item) => item.status === "demande");
  const handled = items.filter((item) => item.status !== "demande");

  const replace = (next: Booking) =>
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));

  return (
    <div className="space-y-5">
      <AdminCard
        title="Demandes à traiter"
        description={
          pending.length === 0
            ? "Rien en attente. Les nouvelles demandes apparaissent ici et déclenchent une notification."
            : `${pending.length} ${pending.length > 1 ? "personnes attendent" : "personne attend"} votre réponse.`
        }
      >
        {pending.length > 0 ? (
          <ul className="space-y-4">
            {pending.map((booking) => (
              <li key={booking.id}>
                <BookingRow booking={booking} onUpdated={replace} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </AdminCard>

      {handled.length > 0 && (
        <AdminCard
          title="Historique"
          description="Les demandes que vous avez déjà traitées, de la plus récente à la plus ancienne."
        >
          <ul className="space-y-4">
            {handled.map((booking) => (
              <li key={booking.id}>
                <BookingRow booking={booking} onUpdated={replace} />
              </li>
            ))}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BookingRow({
  booking,
  onUpdated,
}: {
  booking: Booking;
  onUpdated: (next: Booking) => void;
}) {
  const { run, pending, error, done } = useAdminAction();

  const [note, setNote] = useState(booking.note);
  const [open, setOpen] = useState(false);

  const answer = async (status: BookingStatus) => {
    await run(
      () =>
        patchJson<{ booking: Booking }>(`/api/avocats/rendez-vous/${booking.id}`, {
          status,
          note: note.trim(),
        }),
      (data) => {
        if (data?.booking) onUpdated(data.booking);
        setOpen(false);
      },
    );
  };

  const contact = booking.contact;
  const waiting = booking.status === "demande";

  return (
    <article
      className={cn(
        "rounded-2xl border p-5",
        waiting ? "border-gold-500/35 bg-gold-50/40" : "border-marine-950/8",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-lg/snug font-bold text-marine-950">
            {booking.title || "Demande de rendez-vous"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marine-600">
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar className="size-3.5 text-marine-400" />
              {booking.slotLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconVideo className="size-3.5 text-marine-400" />
              {modeLabels[booking.mode] ?? booking.mode}
            </span>
            {booking.price > 0 && (
              <span className="font-semibold text-marine-900">
                {formatFcfa(booking.price)}
              </span>
            )}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase ring-1 ring-inset",
            toneStyles[booking.statusTone] ?? toneStyles.neutral,
          )}
        >
          {booking.statusLabel}
        </span>
      </div>

      {contact && (
        <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-marine-950/6 pt-4 text-sm sm:grid-cols-2">
          <Detail label="Demandeur">
            {contact.name}
            {contact.alias && (
              // Le pseudonyme dit que la demande vient d'un compte enregistré :
              // le praticien traite les deux, mais pas avec la même confiance.
              <span className="ml-1.5 text-xs text-marine-500">({contact.alias})</span>
            )}
          </Detail>

          {contact.phone && (
            <Detail label="Téléphone">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-gold-700"
              >
                <IconPhone className="size-3.5 text-marine-400" />
                {contact.phone}
              </a>
            </Detail>
          )}

          {contact.email && (
            <Detail label="E-mail">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 break-all hover:text-gold-700"
              >
                <IconMail className="size-3.5 shrink-0 text-marine-400" />
                {contact.email}
              </a>
            </Detail>
          )}

          {contact.city && <Detail label="Ville">{contact.city}</Detail>}
        </dl>
      )}

      {booking.message && (
        <p className="mt-4 rounded-xl bg-white p-4 text-sm/relaxed whitespace-pre-line text-marine-700 ring-1 ring-marine-950/6 ring-inset">
          {booking.message}
        </p>
      )}

      {booking.note && !open && (
        <p className="mt-4 text-sm/relaxed text-marine-600">
          <span className="font-semibold text-marine-900">Votre réponse : </span>
          {booking.note}
        </p>
      )}

      <Feedback error={error} done={done} doneLabel="Demande mise à jour." />

      {open && (
        <div className="mt-4">
          <TextArea
            aria-label="Mot pour le demandeur"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Précisez l’heure exacte, l’adresse, ou le motif du refus…"
            className="min-h-24"
          />
          <p className="mt-1.5 text-xs text-marine-500">
            Ce mot accompagne la notification envoyée au demandeur.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {waiting ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => (open ? answer("confirme") : setOpen(true))}
              className={buttonStyles({ size: "sm" })}
            >
              <IconCheck className="size-4" />
              {open ? (pending ? "Envoi…" : "Confirmer") : "Répondre"}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => answer("refuse")}
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: "border-marine-950/15 text-marine-600 hover:text-danger-600",
              })}
            >
              <IconClose className="size-4" />
              Décliner
            </button>
          </>
        ) : (
          booking.status === "confirme" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => answer("honore")}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              <IconCheck className="size-4" />
              Marquer comme honoré
            </button>
          )
        )}

        <Link
          href="/messages?profil=avocat"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800"
        >
          <IconMessages className="size-4" />
          Ouvrir la conversation
        </Link>
      </div>
    </article>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-marine-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-marine-900">{children}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-12 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconCalendar className="size-5" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">
        Aucune demande en attente
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm/relaxed text-marine-600">
        Les demandes arrivent depuis votre vitrine : bouton « Réserver » d’une
        prestation, ou page de prise de rendez-vous. Une vitrine complète en
        reçoit davantage.
      </p>
    </div>
  );
}
