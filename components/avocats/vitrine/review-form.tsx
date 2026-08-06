"use client";

import { useState } from "react";
import Link from "next/link";
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
  IconUser,
} from "@/components/ui/icons";

/**
 * Ce que la session citoyenne apporte au formulaire.
 *
 * `email` n'est jamais affiché sur la vitrine : il sert à rattacher l'avis au
 * compte, ce qui le rend « certifié ». Il est envoyé, pas montré.
 */
export type ReviewIdentity = {
  name: string;
  email: string;
};

/**
 * Dépôt d'un avis sur la vitrine d'un praticien — module 8.1.
 *
 * Le formulaire n'est ouvert qu'aux comptes connectés. Ce n'est pas une
 * commodité technique : un avis anonyme de passage n'engage rien, se duplique
 * à volonté et ne peut pas être rattaché à une consultation réelle. La
 * plateforme promet des avis certifiés — elle ne peut pas tenir cette promesse
 * en acceptant des dépôts sans identité.
 *
 * Nom et adresse viennent donc de la session, pré-remplis. Le nom reste
 * modifiable — beaucoup de gens signent « Emmanuel T. » plutôt que de leur
 * état civil complet — mais l'adresse, elle, n'est pas saisie : c'est elle qui
 * porte la certification, la laisser modifiable la viderait de son sens.
 *
 * L'avis part en modération, et c'est dit avant l'envoi, pas après : un
 * formulaire qui laisse croire à une publication instantanée produit un second
 * avis identique dix minutes plus tard, puis une réclamation.
 */
export function ReviewForm({
  slug,
  name,
  identity,
}: {
  slug: string;
  name: string;
  /** Identité du citoyen connecté, ou null s'il ne l'est pas. */
  identity: ReviewIdentity | null;
}) {
  const { run, reset, pending, error, errors } = useAdminAction();

  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState(identity?.name ?? "");
  const [context, setContext] = useState("");
  const [quote, setQuote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (identity === null) {
    return <SignedOutNotice slug={slug} name={name} />;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await run(() =>
      postJson(`/api/avis/${slug}`, {
        author: author.trim(),
        // Jamais saisie : celle du compte, et elle seule, atteste que l'avis
        // vient d'une personne enregistrée.
        author_email: identity!.email,
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
          Il sera publié après vérification par notre équipe. Vous le retrouvez
          en attendant dans{" "}
          <Link href="/compte" className="font-semibold underline underline-offset-2">
            votre espace personnel
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <p className="flex items-start gap-2.5 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
        <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
        Votre avis passe par une vérification avant d’apparaître sur la fiche de{" "}
        {name}. Il sera marqué « certifié » puisqu’il émane de votre compte, et
        ne pourra plus être modifié ensuite.
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
        <Field
          label="Signature"
          htmlFor="avis-auteur"
          required
          hint="Le nom affiché sous votre avis. Une initiale de famille suffit."
          error={errors.author}
        >
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
          label="Motif de la consultation"
          htmlFor="avis-contexte"
          optional
          hint="Par exemple : « Création de SARL »."
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
      </div>

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
    </form>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Écran servi au visiteur non connecté.
 *
 * Le formulaire n'est pas affiché grisé : laisser quelqu'un rédiger son avis
 * avant de lui apprendre qu'il faut un compte est le meilleur moyen de perdre
 * l'avis et la personne. Le retour est prévu — `?suite=` ramène sur la fiche.
 */
function SignedOutNotice({ slug, name }: { slug: string; name: string }) {
  const suite = `/avocats/${slug}`;

  return (
    <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-10 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconUser className="size-5" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">
        Les avis sont réservés aux comptes vérifiés
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm/relaxed text-marine-600">
        C’est ce qui permet d’afficher « avis certifié » sous votre nom, et
        d’écarter les faux avis déposés en série. Le compte est gratuit et prend
        une minute.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={`/compte/inscription?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ size: "sm" })}
        >
          Créer mon compte
        </Link>
        <Link
          href={`/compte/connexion?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          J’ai déjà un compte
        </Link>
      </div>

      <p className="mt-5 text-xs text-marine-500">
        Vous avez consulté {name} ? Votre retour aidera les prochains visiteurs à
        se décider.
      </p>
    </div>
  );
}
