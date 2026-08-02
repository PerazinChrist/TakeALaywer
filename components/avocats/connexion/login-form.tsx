"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { postJson } from "@/lib/api/client";
import type { Errors } from "@/lib/avocats/signup";
import type { LoginResult } from "@/lib/api/types";
import { IconAlert, IconArrowRight, IconLock } from "@/components/ui/icons";

/**
 * Formulaire de connexion à l'espace praticien.
 *
 * Il ne manipule aucun jeton : le Route Handler dépose un cookie httpOnly que
 * ce composant ne peut pas lire. D'où le `router.refresh()` après succès —
 * c'est le rendu serveur qui, lui, verra la session.
 */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    setMessage("");
    setErrors({});

    const result = await postJson<LoginResult>("/api/avocats/connexion", {
      email,
      password,
    });

    if (!result.ok) {
      setPending(false);
      setErrors(result.errors);
      setMessage(result.message);
      return;
    }

    // On ne repasse pas `pending` à false : la navigation suit immédiatement,
    // et réactiver le bouton laisserait le temps d'un second envoi.
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

      <Field label="Adresse e-mail" htmlFor="email" error={errors.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@cabinet.cm"
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={errors.password} required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          invalid={Boolean(errors.password)}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={buttonStyles({ size: "md", full: true })}
      >
        {pending ? "Connexion…" : "Se connecter"}
        {!pending && (
          <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      <p className="flex items-start gap-2 text-xs/relaxed text-marine-500">
        <IconLock className="mt-px size-3.5 shrink-0 text-trust-600" />
        Votre session reste ouverte sept jours sur cet appareil. Elle est fermée
        automatiquement si votre compte est suspendu.
      </p>

      <p className="border-t border-marine-950/8 pt-5 text-center text-sm text-marine-600">
        Pas encore inscrit ?{" "}
        <Link
          href="/avocats/inscription"
          className="font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
        >
          Créer un compte avocat
        </Link>
      </p>
    </form>
  );
}
