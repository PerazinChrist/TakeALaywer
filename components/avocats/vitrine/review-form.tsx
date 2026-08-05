"use client";

import { useState } from "react";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { buttonStyles } from "@/components/ui/button";
import { postJson } from "@/lib/api/client";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { cn } from "@/lib/utils";
import {
  IconAlert,
  IconCheck,
  IconSend,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";

/**
 * Dépôt d'un avis sur la vitrine d'un praticien — module 8.1.
 *
 * L'avis part en modération et n'apparaît pas immédiatement : c'est dit avant
 * l'envoi, pas après. Un formulaire qui laisse croire à une publication
 * instantanée produit un second avis identique dix minutes plus tard, puis un
 * message de réclamation.
 *
 * L'adresse e-mail sert à rattacher l'avis à un compte citoyen existant, ce qui
 * le rend « certifié ». Elle n'est jamais affichée.
 */
export function ReviewForm({ slug, name }: { slug: string; name: string }) {
  const { run, reset, pending, error, errors, done } = useAdminAction();

  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [context, setContext] = useState("");
  const [quote, setQuote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await run(() =>
      postJson(`/api/avis/${slug}`, {
        author: author.trim(),
        author_email: email.trim(),
        rating,
        context: context.trim(),
        quote: quote.trim(),
      }),
    );

    if (ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-trust-500/25 bg-trust-500/8 p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-trust-600">
          <IconCheck className="size-6" />
        </span>
        <p className="mt-4 font-serif text-lg font-bold text-marine-950">
          Merci pour votre avis
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm/relaxed text-marine-600">
          Il sera publié après vérification par notre équipe. Vous n’avez rien
          d’autre à faire.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <p className="flex items-start gap-2.5 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
        <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
        Votre avis passe par une vérification avant d’apparaître sur la fiche de{" "}
        {name}. Il ne pourra plus être modifié ensuite.
      </p>

      <fieldset>
        <legend className="text-sm font-semibold text-marine-900">
          Votre note <span className="text-danger-600">*</span>
        </legend>

        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRating(value);
                reset();
              }}
              aria-label={`${value} étoile${value > 1 ? "s" : ""} sur 5`}
              aria-pressed={rating === value}
              className="rounded-lg p-1 transition-transform hover:scale-110"
            >
              <IconStar
                className={cn(
                  "size-7",
                  value <= rating ? "text-gold-500" : "text-marine-200",
                )}
              />
            </button>
          ))}

          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-marine-600">{rating}/5</span>
          )}
        </div>

        {errors.rating && (
          <p className="mt-1.5 text-sm text-danger-600">{errors.rating}</p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Votre nom" htmlFor="avis-auteur" required error={errors.author}>
          <TextInput
            id="avis-auteur"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Emmanuel T."
            invalid={Boolean(errors.author)}
            autoComplete="name"
          />
        </Field>

        <Field
          label="Votre e-mail"
          htmlFor="avis-email"
          optional
          hint="Jamais affiché. Sert à certifier l’avis si vous avez un compte."
          error={errors.author_email}
        >
          <TextInput
            id="avis-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@exemple.cm"
            invalid={Boolean(errors.author_email)}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field
        label="Motif de la consultation"
        htmlFor="avis-contexte"
        optional
        hint="Par exemple : « Création de SARL » ou « Vérification de titre »."
        error={errors.context}
      >
        <TextInput
          id="avis-contexte"
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Création de SARL"
          invalid={Boolean(errors.context)}
        />
      </Field>

      <Field
        label="Votre expérience"
        htmlFor="avis-texte"
        required
        hint="20 caractères au minimum. N’évoquez aucun détail confidentiel de votre dossier."
        error={errors.quote}
      >
        <TextArea
          id="avis-texte"
          value={quote}
          onChange={(event) => setQuote(event.target.value)}
          placeholder="Ce qui s’est bien passé, ce qui aurait pu l’être mieux…"
          className="min-h-32"
          invalid={Boolean(errors.quote)}
        />
      </Field>

      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700">
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonStyles({ size: "md" })}>
        <IconSend className="size-4" />
        {pending ? "Envoi…" : "Publier mon avis"}
      </button>

      {done && !submitted && (
        <p className="text-sm text-trust-600">Avis envoyé.</p>
      )}
    </form>
  );
}
