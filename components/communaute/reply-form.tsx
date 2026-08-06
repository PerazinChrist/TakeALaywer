"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { TextArea } from "@/components/ui/form";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { postJson } from "@/lib/api/client";
import type { NeedReply } from "@/lib/api/types";
import { IconAlert, IconBadgeCheck, IconSend } from "@/components/ui/icons";

/**
 * Dépôt d'une réponse dans l'espace communautaire.
 *
 * Ouvert aux deux populations, et le formulaire le dit : un praticien connecté
 * lit « votre réponse portera le badge Avocat » avant d'écrire, parce que cela
 * change ce qu'il engage. Un membre lit qu'il partage une expérience, pas un
 * conseil juridique.
 */
export function ReplyForm({
  slug,
  role,
}: {
  slug: string;
  /** Versant du lecteur connecté, ou null s'il ne l'est pas. */
  role: "client" | "account" | null;
}) {
  const router = useRouter();
  const { run, pending, error, errors } = useAdminAction();

  const [body, setBody] = useState("");

  if (role === null) {
    return (
      <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-8 text-center">
        <p className="text-[0.95rem]/relaxed text-marine-700">
          Connectez-vous pour répondre. Les avocats inscrits au Barreau voient
          leur réponse signée du badge « Avocat ».
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/compte/connexion?suite=${encodeURIComponent(`/communaute/${slug}`)}`}
            className={buttonStyles({ size: "sm" })}
          >
            Se connecter
          </Link>
          <Link
            href="/avocats/connexion"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Je suis avocat
          </Link>
        </div>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await run(() =>
      postJson<{ reply: NeedReply }>(`/api/besoins/${encodeURIComponent(slug)}/reponses`, {
        body: body.trim(),
      }),
    );

    if (!ok) return;

    setBody("");
    // Le fil est rechargé côté serveur : la réponse y revient avec son badge et
    // son horodatage, tels que le backend les a établis.
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {role === "account" && (
        <p className="flex items-start gap-2.5 rounded-xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <IconBadgeCheck className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          Votre réponse paraîtra sous le badge « Avocat », avec un lien vers votre
          vitrine. Elle engage votre nom : restez sur le principe, sans qualifier
          un dossier que vous n’avez pas lu.
        </p>
      )}

      <TextArea
        aria-label="Votre réponse"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          role === "account"
            ? "Le texte applicable, la démarche à engager, le délai à ne pas laisser passer…"
            : "Ce que vous avez vécu, et ce qui a fonctionné pour vous…"
        }
        className="min-h-36"
        invalid={Boolean(errors.body)}
      />

      {errors.body && <p className="text-sm text-danger-600">{errors.body}</p>}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || body.trim().length === 0}
          className={buttonStyles({ size: "md" })}
        >
          <IconSend className="size-4" />
          {pending ? "Envoi…" : "Publier ma réponse"}
        </button>

        <p className="text-xs/relaxed text-marine-500">
          Aucune réponse publiée ici ne remplace une consultation.
        </p>
      </div>
    </form>
  );
}
