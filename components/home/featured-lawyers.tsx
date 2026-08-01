import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { LawyerBadge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { featuredLawyers } from "@/lib/data/home";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconClock,
  IconFileText,
  IconMapPin,
} from "@/components/ui/icons";

/** Annuaire — aperçu des profils publics (module 2.1) avec badges (8.3). */
export function FeaturedLawyers() {
  return (
    <section className="bg-panel py-20 lg:py-28" aria-labelledby="avocats-titre">
      <div className="container-page">
        <SectionHeading
          eyebrow="Annuaire vérifié"
          title={<span id="avocats-titre">Des avocats vérifiés, pas des annonces</span>}
          description="Carte professionnelle et inscription au Barreau contrôlées avant publication. Les honoraires indicatifs sont affichés sur chaque fiche."
          action={
            <Link href="/avocats" className={buttonStyles({ variant: "outline", size: "sm" })}>
              Parcourir les 7 000 profils
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredLawyers.map((lawyer) => (
            <li
              key={lawyer.slug}
              className="group flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/5 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <Avatar initials={lawyer.initials} size="lg" online={lawyer.online} />
                {lawyer.online && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-semibold text-trust-600">
                    <span className="size-1.5 rounded-full bg-trust-500" />
                    En ligne
                  </span>
                )}
              </div>

              <h3 className="mt-4 flex items-center gap-1.5 font-serif text-lg font-bold text-marine-950">
                <Link href={`/avocats/${lawyer.slug}`} className="hover:text-gold-700">
                  {lawyer.name}
                </Link>
                <IconBadgeCheck className="size-4 shrink-0 text-gold-500" />
              </h3>

              <p className="mt-1 text-sm text-marine-600">
                {lawyer.specialties.join(" · ")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-marine-500">
                <span className="inline-flex items-center gap-1">
                  <IconMapPin className="size-3.5 text-gold-500" />
                  {lawyer.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconFileText className="size-3.5 text-gold-500" />
                  {lawyer.articles} guides
                </span>
              </div>

              <Rating value={lawyer.rating} reviews={lawyer.reviews} className="mt-3" compact />

              <div className="mt-4 flex flex-wrap gap-1.5">
                {lawyer.badges.map((badge) => (
                  <LawyerBadge key={badge} kind={badge} />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-1.5 border-t border-marine-950/6 pt-4 text-sm font-medium text-marine-600">
                <IconClock className="size-4 text-trust-500" />
                {lawyer.responseTime}
              </div>

              <Link
                href={`/avocats/${lawyer.slug}`}
                className={buttonStyles({ variant: "outline", size: "sm", full: true, className: "mt-3" })}
              >
                Voir le profil
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
