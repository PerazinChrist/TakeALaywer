import { SectionHeading } from "@/components/ui/section-heading";
import { ReviewCard } from "@/components/public/review-card";
import type { PublicReview } from "@/lib/api/public";

/**
 * Encadrés d'avis certifiés — directive-ui.md § 3 / module 8.1.
 *
 * Les avis affichés ici sont ceux que la modération a publiés et qui émanent
 * d'un compte citoyen : la promesse « après une interaction réelle » est tenue
 * par la requête, pas seulement par le texte de la section.
 */
export function Testimonials({ reviews }: { reviews: PublicReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="avis-titre">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Avis certifiés"
          title={<span id="avis-titre">Ils ont osé poser leur question</span>}
          description="Chaque avis provient d’un citoyen ayant réellement échangé avec un avocat ou acheté un guide sur la plateforme."
        />

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      </div>
    </section>
  );
}
