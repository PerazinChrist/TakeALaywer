"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { postJson } from "@/lib/api/client";
import { formatFcfa } from "@/lib/utils";
import type { Booking, Conversation } from "@/lib/api/types";
import type { Prestation } from "@/lib/data/lawyer-profile";
import {
  IconAlert,
  IconCalendar,
  IconCheck,
  IconMessages,
  IconSend,
} from "@/components/ui/icons";

/** Coordonnées pré-remplies depuis la session citoyenne, quand elle existe. */
export type BookingContact = {
  name: string;
  email: string;
  phone: string;
};

/**
 * Créneaux — repris de TAL_Bookings::slots().
 *
 * Des demi-journées et non des heures : la plateforme ne connaît pas l'agenda
 * réel du cabinet, et proposer « 14 h 30 » laisserait croire à une
 * disponibilité vérifiée. L'heure exacte se cale dans la conversation qui
 * accompagne la demande.
 */
const SLOTS = [
  { value: "matin", label: "Matin (8 h – 12 h)" },
  { value: "apres_midi", label: "Après-midi (13 h – 17 h)" },
  { value: "fin_jour", label: "Fin de journée (17 h – 19 h)" },
  { value: "flexible", label: "Je m’adapte" },
];

const MODES = [
  { value: "visio", label: "En visioconférence" },
  { value: "cabinet", label: "Au cabinet" },
  { value: "telephone", label: "Par téléphone" },
  { value: "document", label: "Sur pièces, sans rendez-vous" },
];

/**
 * Mini-formulaire de réservation et de prise de rendez-vous.
 *
 * Un seul composant pour les deux : réserver une prestation tarifée et demander
 * un créneau produisent la même demande côté cabinet — un nom, un moyen de le
 * rappeler, un créneau souhaité. Seule change la prestation attachée, et donc
 * le montant annoncé.
 *
 * Il fonctionne sans compte : c'est souvent le premier geste de quelqu'un qui
 * découvre la plateforme. Un citoyen connecté, lui, voit ses coordonnées déjà
 * remplies et repart avec un fil de discussion ouvert.
 */
export function BookingForm({
  lawyerSlug,
  lawyerName,
  prestations,
  contact,
  signedIn,
  defaultPrestationId = "",
  compact = false,
}: {
  lawyerSlug: string;
  lawyerName: string;
  /** Prestations tarifées du cabinet. Vide : la demande porte sur un simple créneau. */
  prestations: Prestation[];
  contact?: BookingContact | null;
  signedIn: boolean;
  /** Prestation pré-sélectionnée, quand on arrive d'une carte de prestation. */
  defaultPrestationId?: string;
  /** Rendu resserré, pour l'intérieur d'une boîte de dialogue. */
  compact?: boolean;
}) {
  const { run, pending, error, errors } = useAdminAction();

  const [prestationId, setPrestationId] = useState(defaultPrestationId);
  // Typé large volontairement : le select propose les quatre modes du
  // référentiel, indépendamment de celui que porte la prestation choisie.
  const [mode, setMode] = useState<string>(
    prestations.find((item) => item.id === defaultPrestationId)?.mode ?? "visio",
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("flexible");
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [message, setMessage] = useState("");

  const [done, setDone] = useState<{ booking: Booking; conversation?: Conversation } | null>(
    null,
  );

  const selected = prestations.find((item) => item.id === prestationId) ?? null;

  // Une date antérieure à demain n'a pas de sens : le cabinet répond sous 48 h.
  // Figée à l'initialisation plutôt que recalculée à chaque rendu — lire
  // l'horloge pendant le rendu est impur, et le plancher n'a pas à bouger sous
  // les doigts de quelqu'un qui remplit le formulaire à minuit.
  const [minDate] = useState(() =>
    new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    await run(
      () =>
        postJson<{ booking: Booking; conversation?: Conversation }>("/api/reservations", {
          lawyer: lawyerSlug,
          kind: selected ? "prestation" : "rendez_vous",
          prestation_id: selected?.id ?? "",
          prestation_title: selected?.title ?? "",
          mode,
          preferred_on: date,
          preferred_slot: slot,
          contact_name: name.trim(),
          contact_email: email.trim(),
          contact_phone: phone.trim(),
          message: message.trim(),
        }),
      (data) => {
        if (data) setDone(data);
      },
    );
  }

  if (done) {
    return <Confirmation result={done} lawyerName={lawyerName} signedIn={signedIn} />;
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-4" : "space-y-5"} noValidate>
      {prestations.length > 0 && (
        <Field
          label="Prestation"
          htmlFor="rdv-prestation"
          hint="Laissez « Premier échange » si vous ne savez pas encore ce dont vous avez besoin."
        >
          <SelectInput
            id="rdv-prestation"
            value={prestationId}
            onChange={(event) => {
              setPrestationId(event.target.value);

              const next = prestations.find((item) => item.id === event.target.value);

              // Le mode suit la prestation choisie : une consultation « sur
              // pièces » ne se tient pas en visioconférence.
              if (next) setMode(next.mode);
            }}
          >
            <option value="">Premier échange — à définir</option>
            {prestations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {formatFcfa(item.price)}
              </option>
            ))}
          </SelectInput>
        </Field>
      )}

      {selected && (
        <p className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-marine-50 p-4">
          <span className="text-sm text-marine-600">Honoraires annoncés</span>
          <span className="font-serif text-lg font-bold text-marine-950">
            {formatFcfa(selected.price)}
            <span className="ml-1 text-xs font-normal text-marine-500">{selected.unit}</span>
          </span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date souhaitée" htmlFor="rdv-date" optional error={errors.preferred_on}>
          <TextInput
            id="rdv-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>

        <Field label="Moment de la journée" htmlFor="rdv-creneau" optional>
          <SelectInput
            id="rdv-creneau"
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
          >
            {SLOTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <Field label="Comment souhaitez-vous être reçu ?" htmlFor="rdv-mode" optional>
        <SelectInput id="rdv-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
          {MODES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Votre nom" htmlFor="rdv-nom" required error={errors.contact_name}>
          <TextInput
            id="rdv-nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Emmanuel Tchoumba"
            autoComplete="name"
            invalid={Boolean(errors.contact_name)}
          />
        </Field>

        <Field
          label="Téléphone"
          htmlFor="rdv-tel"
          hint="Le cabinet vous rappelle à ce numéro."
          error={errors.contact_phone}
        >
          <TextInput
            id="rdv-tel"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+237 6 XX XX XX XX"
            autoComplete="tel"
            invalid={Boolean(errors.contact_phone)}
          />
        </Field>
      </div>

      <Field label="Votre e-mail" htmlFor="rdv-email" optional error={errors.contact_email}>
        <TextInput
          id="rdv-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.cm"
          autoComplete="email"
          invalid={Boolean(errors.contact_email)}
        />
      </Field>

      <Field
        label="En deux mots, de quoi s’agit-il ?"
        htmlFor="rdv-message"
        optional
        hint="Le sujet suffit. N’écrivez ici aucune pièce confidentielle."
      >
        <TextArea
          id="rdv-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Litige avec mon bailleur, audience prévue le 12…"
          className={compact ? "min-h-24" : "min-h-28"}
        />
      </Field>

      {!signedIn && (
        <p className="rounded-xl bg-marine-50 p-4 text-xs/relaxed text-marine-600">
          Vous pouvez envoyer cette demande sans compte. Avec un compte, elle
          rejoint votre espace personnel et la réponse du cabinet arrive dans
          votre messagerie plutôt que dans un e-mail.{" "}
          <Link
            href={`/compte/inscription?suite=${encodeURIComponent(`/avocats/${lawyerSlug}/rendez-vous`)}`}
            className="font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
          >
            Créer un compte
          </Link>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonStyles({ size: compact ? "md" : "lg", full: compact })}
      >
        <IconSend className="size-4" />
        {pending ? "Envoi…" : selected ? "Réserver cette prestation" : "Demander un rendez-vous"}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Écran de confirmation.
 *
 * Il dit ce qui va se passer ensuite, pas seulement que « c'est envoyé » : une
 * demande de rendez-vous laisse la personne dans l'attente, et une confirmation
 * muette produit une seconde demande une heure plus tard.
 */
function Confirmation({
  result,
  lawyerName,
  signedIn,
}: {
  result: { booking: Booking; conversation?: Conversation };
  lawyerName: string;
  signedIn: boolean;
}) {
  const { booking, conversation } = result;

  return (
    <div className="rounded-2xl border border-trust-500/25 bg-trust-500/8 p-6 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-trust-600"
        aria-hidden="true"
      >
        <IconCheck className="size-6" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">
        Demande transmise à {lawyerName}
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm/relaxed text-marine-700">
        {booking.title ? `${booking.title} · ` : ""}
        {booking.slotLabel}. Le cabinet confirme ou propose un autre créneau sous
        48 heures ouvrées.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {conversation && (
          <Link
            href={`/messages/${conversation.id}`}
            className={buttonStyles({ size: "sm" })}
          >
            <IconMessages className="size-4" />
            Ouvrir la conversation
          </Link>
        )}

        {signedIn && (
          <Link
            href="/compte?section=rendez-vous"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <IconCalendar className="size-4" />
            Mes rendez-vous
          </Link>
        )}
      </div>
    </div>
  );
}
