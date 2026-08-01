import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { certifiedReviews } from "@/lib/data/home";
import { IconMapPin, IconQuote, IconShieldCheck } from "@/components/ui/icons";

/**
 * Encadrés d'avis certifiés — directive-ui.md § 3 / module 8.1.
 * Les avis ne sont collectés qu'après une interaction réelle citoyen ↔ avocat.
 */
export function Testimonials() {
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
          {certifiedReviews.map((review) => (
            <li
              key={review.id}
              className="relative flex flex-col rounded-3xl border border-marine-950/8 bg-panel p-7"
            >
              <IconQuote
                className="absolute top-6 right-6 size-8 text-gold-500/15"
                aria-hidden="true"
              />

              <Rating value={review.rating} />

              <blockquote className="mt-4 flex-1 text-[0.95rem]/relaxed text-marine-700">
                « {review.quote} »
              </blockquote>

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-marine-950/6 pt-4">
                <div>
                  <p className="font-semibold text-marine-950">{review.author}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-marine-500">
                    <IconMapPin className="size-3.5" />
                    {review.city} · {review.context}
                  </p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-semibold text-trust-600"
                  title="Avis vérifié après une interaction réelle"
                >
                  <IconShieldCheck className="size-3.5" />
                  Certifié
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
