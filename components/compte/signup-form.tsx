"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { CheckboxField, Field, TextInput } from "@/components/ui/form";
import { postJson } from "@/lib/api/client";
import type { ClientAuthResult, FieldErrors } from "@/lib/api/types";
import { IconAlert, IconArrowRight, IconLock } from "@/components/ui/icons";

/**
 * Création d'un compte citoyen — trois champs, un seul écran.
 *
 * Volontairement à l'opposé du wizard en cinq étapes des praticiens. Un avocat
 * s'inscrit pour être publié dans un annuaire, ce qui justifie un dossier ; un
 * citoyen s'inscrit pour retrouver un guide qu'il vient de lire, et chaque champ
 * de plus lui coûte une raison d'abandonner. Ville, téléphone et nom se
 * renseignent plus tard, depuis l'espace personnel, quand ils servent vraiment.
 *
 * Comme le formulaire praticien, il ne manipule aucun jeton : le Route Handler
 * dépose un cookie httpOnly que ce composant ne peut pas lire. D'où le
 * `router.refresh()` après succès — c'est le rendu serveur qui verra la session.
 */
export function CitizenSignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [pseudonym, setPseudonym] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  /** Champ-piège : invisible pour un humain, rempli par un robot. */
  const [website, setWebsite] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    setMessage("");
    setErrors({});

    const result = await postJson<ClientAuthResult>("/api/compte/inscription", {
      pseudonym,
      email,
      password,
      acceptTerms,
      // Le plugin exige les deux consentements ; les séparer en deux cases
      // ferait deux clics pour une seule décision, celle de créer un compte.
      acceptData: acceptTerms,
      website_url: website,
    });

    if (!result.ok) {
      setPending(false);
      setErrors(result.errors);
      setMessage(result.message);
      return;
    }

    // `pending` reste vrai : la navigation suit immédiatement, et réactiver le
    // bouton laisserait le temps d'un second envoi.
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {message && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
        >
          <IconAlert className="mt-0.5 size-4.5 shrink-0" />
          {message}
        </p>
      )}

      <Field
        label="Prénom ou pseudonyme"
        htmlFor="pseudonym"
        hint="C’est le seul nom que verront les avocats. Vous pourrez le changer."
        error={errors.pseudonym}
        optional
      >
        <TextInput
          id="pseudonym"
          name="pseudonym"
          autoComplete="nickname"
          autoFocus
          value={pseudonym}
          invalid={Boolean(errors.pseudonym)}
          onChange={(event) => setPseudonym(event.target.value)}
          placeholder="Kwame"
        />
      </Field>

      <Field label="Adresse e-mail" htmlFor="email" error={errors.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.cm"
        />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="password"
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
        error={errors.password}
        required
      >
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          invalid={Boolean(errors.password)}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </Field>

      {/* Hors du flux et hors du parcours clavier : seul un robot le remplit. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website_url">Ne pas remplir</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <CheckboxField
        id="acceptTerms"
        checked={acceptTerms}
        onChange={setAcceptTerms}
        error={errors.acceptTerms}
        label={
          <>
            J’accepte les{" "}
            <Link href="/cgu" className="font-semibold text-gold-700 underline underline-offset-2">
              conditions d’utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/confidentialite"
              className="font-semibold text-gold-700 underline underline-offset-2"
            >
              politique de confidentialité
            </Link>
            .
          </>
        }
      />

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={buttonStyles({ size: "md", full: true })}
      >
        {pending ? "Création…" : "Créer mon compte"}
        {!pending && (
          <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      <p className="flex items-start gap-2 text-xs/relaxed text-marine-500">
        <IconLock className="mt-px size-3.5 shrink-0 text-trust-600" />
        Aucun document ni justificatif ne vous sera demandé. Votre nom réel n’est
        jamais affiché : les avocats ne voient que votre pseudonyme.
      </p>

      <p className="border-t border-marine-950/8 pt-5 text-center text-sm text-marine-600">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/compte/connexion"
          className="font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
