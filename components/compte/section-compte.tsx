"use client";

import { useState } from "react";
import { AdminCard } from "@/components/avocats/admin/admin-ui";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { patchJson, postJson } from "@/lib/api/client";
import type { ApiClient, ClientDraft, FieldErrors } from "@/lib/api/types";
import { IconAlert, IconCheck, IconLock } from "@/components/ui/icons";

/**
 * Section « Mon compte » de l'espace citoyen.
 *
 * Deux cartes indépendantes : les coordonnées d'un côté, le mot de passe de
 * l'autre. Les séparer évite qu'une erreur de mot de passe fasse perdre une
 * adresse déjà saisie, et permet d'exiger le mot de passe courant uniquement là
 * où il a un sens.
 */
export function CitizenAccountSection({
  client,
  onUpdated,
}: {
  client: ApiClient;
  onUpdated: (client: ApiClient) => void;
}) {
  return (
    <div className="space-y-6">
      <ProfileCard client={client} onUpdated={onUpdated} />
      <PasswordCard />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ProfileCard({
  client,
  onUpdated,
}: {
  client: ApiClient;
  onUpdated: (client: ApiClient) => void;
}) {
  const [draft, setDraft] = useState<Required<ClientDraft>>({
    pseudonym: client.pseudonym,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    city: client.city,
    district: client.district,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState(false);

  const set = (field: keyof ClientDraft) => (value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    setFeedback(null);
    setErrors({});

    const result = await patchJson<{ client: ApiClient }>("/api/compte/profil", draft);

    setPending(false);

    if (!result.ok || !result.data) {
      setErrors(result.errors);
      setFeedback({ tone: "error", text: result.message });
      return;
    }

    // Le pseudonyme revient éventuellement suffixé — deux citoyens ne peuvent
    // pas porter le même. On réaligne le formulaire sur ce que la base a retenu
    // plutôt que de laisser affiché ce qui a été demandé.
    const saved = result.data.client;

    onUpdated(saved);
    setDraft((current) => ({ ...current, pseudonym: saved.pseudonym }));
    setFeedback({
      tone: "success",
      text:
        saved.pseudonym !== draft.pseudonym
          ? `Enregistré. Le pseudonyme « ${draft.pseudonym} » était pris : vous êtes « ${saved.pseudonym} ».`
          : "Vos informations sont enregistrées.",
    });
  };

  return (
    <AdminCard
      title="Mes informations"
      description="Rien n’est obligatoire ici, sauf le pseudonyme et l’adresse e-mail."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <FeedbackNote feedback={feedback} />

        <Field
          label="Pseudonyme"
          htmlFor="pseudonym"
          hint="Le seul nom visible par les avocats et sur vos avis."
          error={errors.pseudonym}
          required
        >
          <TextInput
            id="pseudonym"
            value={draft.pseudonym}
            invalid={Boolean(errors.pseudonym)}
            onChange={(event) => set("pseudonym")(event.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" htmlFor="firstName" error={errors.firstName} optional>
            <TextInput
              id="firstName"
              autoComplete="given-name"
              value={draft.firstName}
              invalid={Boolean(errors.firstName)}
              onChange={(event) => set("firstName")(event.target.value)}
            />
          </Field>

          <Field label="Nom" htmlFor="lastName" error={errors.lastName} optional>
            <TextInput
              id="lastName"
              autoComplete="family-name"
              value={draft.lastName}
              invalid={Boolean(errors.lastName)}
              onChange={(event) => set("lastName")(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Adresse e-mail" htmlFor="email" error={errors.email} required>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={draft.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => set("email")(event.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Téléphone"
            htmlFor="phone"
            hint="6XX XX XX XX"
            error={errors.phone}
            optional
          >
            <TextInput
              id="phone"
              type="tel"
              autoComplete="tel"
              value={draft.phone}
              invalid={Boolean(errors.phone)}
              onChange={(event) => set("phone")(event.target.value)}
            />
          </Field>

          <Field label="Ville" htmlFor="city" error={errors.city} optional>
            <TextInput
              id="city"
              autoComplete="address-level2"
              value={draft.city}
              invalid={Boolean(errors.city)}
              onChange={(event) => set("city")(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Quartier" htmlFor="district" error={errors.district} optional>
          <TextInput
            id="district"
            value={draft.district}
            invalid={Boolean(errors.district)}
            onChange={(event) => set("district")(event.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={buttonStyles({ size: "sm" })}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </AdminCard>
  );
}

/* -------------------------------------------------------------------------- */

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    setFeedback(null);
    setErrors({});

    const result = await postJson<{ message: string }>("/api/compte/mot-de-passe", {
      currentPassword,
      password,
      passwordConfirm,
    });

    setPending(false);

    if (!result.ok || !result.data) {
      setErrors(result.errors);
      setFeedback({ tone: "error", text: result.message });
      return;
    }

    // Les champs sont vidés dès le succès : laisser un mot de passe en clair
    // dans un formulaire d'une page qui reste ouverte n'a aucun intérêt.
    setCurrentPassword("");
    setPassword("");
    setPasswordConfirm("");
    setFeedback({ tone: "success", text: result.data.message });
  };

  return (
    <AdminCard
      title="Mot de passe"
      description="Le modifier déconnecte vos autres appareils, mais pas celui-ci."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <FeedbackNote feedback={feedback} />

        <Field
          label="Mot de passe actuel"
          htmlFor="currentPassword"
          error={errors.currentPassword}
          required
        >
          <TextInput
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            invalid={Boolean(errors.currentPassword)}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </Field>

        <Field
          label="Nouveau mot de passe"
          htmlFor="newPassword"
          hint="8 caractères minimum, avec au moins une lettre et un chiffre."
          error={errors.password}
          required
        >
          <TextInput
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        <Field
          label="Confirmation"
          htmlFor="passwordConfirm"
          error={errors.passwordConfirm}
          required
        >
          <TextInput
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            invalid={Boolean(errors.passwordConfirm)}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          <IconLock className="size-4" />
          {pending ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </AdminCard>
  );
}

/* -------------------------------------------------------------------------- */

type Feedback = { tone: "success" | "error"; text: string } | null;

function FeedbackNote({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;

  const error = feedback.tone === "error";

  return (
    <p
      role={error ? "alert" : "status"}
      className={
        error
          ? "flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
          : "flex items-start gap-2.5 rounded-2xl bg-trust-500/10 p-4 text-sm/relaxed font-medium text-trust-700 ring-1 ring-trust-500/25 ring-inset"
      }
    >
      {error ? (
        <IconAlert className="mt-0.5 size-4.5 shrink-0" />
      ) : (
        <IconCheck className="mt-0.5 size-4.5 shrink-0" />
      )}
      {feedback.text}
    </p>
  );
}
