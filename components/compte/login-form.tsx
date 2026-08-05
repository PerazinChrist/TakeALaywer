"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { postJson } from "@/lib/api/client";
import type { ClientAuthResult, FieldErrors } from "@/lib/api/types";
import { IconAlert, IconArrowRight, IconLock } from "@/components/ui/icons";

/**
 * Connexion à l'espace citoyen.
 *
 * Jumeau du formulaire praticien, sur l'autre cookie. Les deux sessions
 * cohabitent : se connecter ici ne ferme pas celle d'un avocat ouvert dans le
 * même navigateur.
 */
export function CitizenLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPending(true);
    setMessage("");
    setErrors({});

    const result = await postJson<ClientAuthResult>("/api/compte/connexion", {
      email,
      password,
    });

    if (!result.ok) {
      setPending(false);
      setErrors(result.errors);
      setMessage(result.message);
      return;
    }

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
          placeholder="vous@exemple.cm"
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
        Votre session reste ouverte trente jours sur cet appareil.
      </p>

      <p className="border-t border-marine-950/8 pt-5 text-center text-sm text-marine-600">
        Pas encore de compte ?{" "}
        <Link
          href="/compte/inscription"
          className="font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
        >
          En créer un en une minute
        </Link>
      </p>

      <p className="text-center text-xs text-marine-500">
        Vous êtes avocat ?{" "}
        <Link href="/avocats/connexion" className="underline underline-offset-2 hover:text-gold-700">
          Accéder à l’espace praticien
        </Link>
      </p>
    </form>
  );
}
