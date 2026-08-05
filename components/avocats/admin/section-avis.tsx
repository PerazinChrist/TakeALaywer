"use client";

import { useCallback, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { TextArea } from "@/components/ui/form";
import { AdminCard } from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { postJson } from "@/lib/api/client";
import {
  IconAlert,
  IconBadgeCheck,
  IconClock,
  IconPencil,
  IconSend,
  IconShieldCheck,
  IconStar,
} from "@/components/ui/icons";

import type { ManagedReview, ReviewsResult } from "@/lib/api/types";

const STATUS = {
  publie: { label: "Publié", tone: "free" as const, Icon: IconShieldCheck },
  en_attente: { label: "En modération", tone: "premium" as const, Icon: IconClock },
  rejete: { label: "Rejeté", tone: "neutral" as const, Icon: IconAlert },
};

/**
 * Section « Avis clients » de l'espace praticien.
 *
 * Les avis arrivent du rendu serveur — et non de la vitrine déjà chargée : le
 * profil public ne porte que les avis publiés, or le praticien doit voir ceux
 * qui sont encore en modération. Découvrir un avis le jour de sa publication ne
 * laisse aucune chance d'y préparer une réponse.
 *
 * Un avis ne se supprime pas et ne se masque pas. Le seul levier du praticien
 * est la réponse publique — c'est ce que dit l'interface, sans bouton qui
 * laisserait espérer autre chose.
 */
export function SectionAvis({ initial }: { initial: ReviewsResult }) {
  const [payload, setPayload] = useState(initial);
  const [loadError, setLoadError] = useState("");

  // Le praticien peut changer de section pendant la requête : sans ce garde,
  // React signalerait une mise à jour sur un arbre démonté.
  const alive = useRef(true);

  /**
   * Recharge la liste après une réponse publiée.
   *
   * Sans indicateur de chargement : la liste est déjà à l'écran, la faire
   * disparaître sous les yeux de celui qui vient d'écrire serait plus
   * déroutant qu'informatif.
   */
  const reload = useCallback(async () => {
    const response = await fetch("/api/avocats/avis", { credentials: "same-origin" });

    if (!alive.current) return;

    if (!response.ok) {
      setLoadError("La liste n’a pas pu être rafraîchie. Rechargez la page.");
      return;
    }

    const data = (await response.json()) as ReviewsResult;

    if (!alive.current) return;

    setLoadError("");
    setPayload(data);
  }, []);

  const reviews = payload.items;
  const counts = payload.counts;
  const average = payload.average;
  const answered = reviews.filter((review) => review.reply).length;
  const pending = counts.en_attente ?? 0;

  return (
    <div className="space-y-5">
      {loadError && (
        <p className="flex items-start gap-2 rounded-xl bg-danger-50 p-4 text-sm text-danger-700">
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {loadError}
        </p>
      )}

      <AdminCard
        title="Réputation"
        description="Les avis sont vérifiés avant publication et ne peuvent pas être supprimés — vous pouvez y répondre publiquement."
      >
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="font-serif text-4xl font-bold text-marine-950">
              {average > 0 ? average.toFixed(1).replace(".", ",") : "—"}
            </p>
            <Rating value={average} className="mt-1" />
          </div>

          <dl className="grid gap-x-8 gap-y-2 text-sm text-marine-600 sm:grid-cols-2">
            <Stat label="avis publiés" value={counts.publie ?? 0} />
            <Stat label="en modération" value={pending} />
            <Stat label="réponses publiées" value={answered} />
            <Stat label="rejetés" value={counts.rejete ?? 0} />
          </dl>
        </div>

        {pending > 0 && (
          <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-gold-50 p-4 text-sm/relaxed text-marine-700 ring-1 ring-gold-500/20 ring-inset">
            <IconClock className="mt-0.5 size-4.5 shrink-0 text-gold-600" />
            {pending} {pending > 1 ? "avis sont" : "avis est"} en cours de
            modération. Vous pouvez préparer votre réponse dès maintenant : elle
            paraîtra en même temps que l’avis.
          </p>
        )}
      </AdminCard>

      {reviews.length === 0 ? (
        <AdminCard title="Aucun avis pour l’instant">
          <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            <IconStar className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
            Les avis arrivent après vos premières consultations passées par la
            plateforme. Ils sont vérifiés avant publication.
          </p>
        </AdminCard>
      ) : (
        reviews.map((review) => (
          <ReviewRow key={review.id} review={review} onReplied={reload} />
        ))
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ReviewRow({
  review,
  onReplied,
}: {
  review: ManagedReview;
  onReplied: () => Promise<void>;
}) {
  const { run, pending, error } = useAdminAction();
  const [editing, setEditing] = useState(!review.reply);
  const [reply, setReply] = useState(review.reply ?? "");

  const status = STATUS[review.status] ?? STATUS.en_attente;

  async function publish() {
    const ok = await run(() =>
      postJson(`/api/avocats/avis/${review.id}/reponse`, { reply: reply.trim() }),
    );

    if (ok) {
      setEditing(false);
      // On recharge plutôt que de patcher l'état local : la réponse enregistrée
      // est datée côté serveur, et l'affichage doit refléter ce qui est réellement
      // publié, pas ce qu'on vient de taper.
      await onReplied();
    }
  }

  return (
    <AdminCard title={review.author}>
      <div className="-mt-3 flex flex-wrap items-center gap-3">
        <Avatar initials={review.initials} size="sm" />
        <Rating value={review.rating} />

        <Badge tone={status.tone}>
          <status.Icon className="size-3.5" />
          {status.label}
        </Badge>

        {review.certified && (
          <Badge tone="free">
            <IconBadgeCheck className="size-3.5" />
            Certifié
          </Badge>
        )}

        <span className="text-xs text-marine-500">
          {review.context ? `${review.context} · ` : ""}
          {review.date}
        </span>
      </div>

      <p className="mt-4 text-sm/relaxed text-marine-700">{review.quote}</p>

      {review.reply && !editing ? (
        <div className="mt-4 rounded-xl bg-marine-50 p-4">
          <p className="mb-1 flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-marine-900 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <IconBadgeCheck className="size-3.5 text-gold-500" />
              Votre réponse publiée
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gold-700 normal-case hover:underline"
            >
              <IconPencil className="size-3.5" />
              Modifier
            </button>
          </p>
          <p className="text-sm/relaxed text-marine-700">{review.reply}</p>
        </div>
      ) : (
        <div className="mt-4">
          <TextArea
            aria-label={`Répondre à ${review.author}`}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Répondre publiquement — sans jamais évoquer le contenu du dossier."
            className="min-h-24"
          />

          <p className="mt-2 text-xs/relaxed text-marine-500">
            Votre réponse est visible de tous. Le secret professionnel s’applique
            ici comme ailleurs : ne confirmez ni l’existence ni le contenu d’un
            dossier.
          </p>

          {error && (
            <p className="mt-2 flex items-start gap-2 text-sm text-danger-700">
              <IconAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={publish}
              disabled={pending || reply.trim() === ""}
              className={buttonStyles({ size: "sm" })}
            >
              <IconSend className="size-4" />
              {pending ? "Publication…" : "Publier ma réponse"}
            </button>

            {review.reply && (
              <button
                type="button"
                onClick={() => {
                  setReply(review.reply ?? "");
                  setEditing(false);
                }}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </AdminCard>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="order-2">{label}</dt>
      <dd className="order-1 font-semibold text-marine-950">{value}</dd>
    </div>
  );
}
