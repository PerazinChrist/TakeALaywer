import Link from "next/link";
import { Rating } from "@/components/ui/rating";
import type { PublicReview } from "@/lib/api/public";
import { IconMapPin, IconQuote, IconShieldCheck } from "@/components/ui/icons";

/**
 * Avis certifié — module 8.1.
 *
 * Le badge « Certifié » n'est posé que lorsque l'avis est rattaché à un compte
 * citoyen : c'est ce lien qui atteste d'une interaction réelle. Un avis déposé
 * par un visiteur de passage est publié après modération, mais sans ce badge.
 */
export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <li className="relative flex flex-col rounded-3xl border border-marine-950/8 bg-panel p-7">
      <IconQuote className="absolute top-6 right-6 size-8 text-gold-500/15" aria-hidden="true" />

      <Rating value={review.rating} />

      <blockquote className="mt-4 flex-1 text-[0.95rem]/relaxed text-marine-700">
        « {review.quote} »
      </blockquote>

      <p className="mt-4 text-sm text-marine-500">
        À propos de{" "}
        <Link
          href={`/avocats/${review.lawyer.slug}`}
          className="font-medium text-marine-800 hover:text-gold-700"
        >
          {review.lawyer.name}
        </Link>
      </p>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-marine-950/6 pt-4">
        <div className="min-w-0">
          <p className="font-semibold text-marine-950">{review.author}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-marine-500">
            <IconMapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {review.city ? `${review.city} · ` : ""}
              {review.context}
            </span>
          </p>
        </div>

        {review.certified && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-semibold text-trust-600"
            title="Avis déposé par un compte citoyen ayant échangé avec ce praticien"
          >
            <IconShieldCheck className="size-3.5" />
            Certifié
          </span>
        )}
      </div>
    </li>
  );
}
