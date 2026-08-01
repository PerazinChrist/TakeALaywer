import Link from "next/link";
import { AutoCarousel } from "@/components/epure/auto-carousel";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { spotlightLawyers, type SpotlightLawyer } from "@/lib/data/home";
import {
  IconBadgeCheck,
  IconChevronRight,
  IconCrown,
  IconMapPin,
} from "@/components/ui/icons";

/**
 * ÉCRAN 2 — « Avocats à la Une ».
 *
 * Une seule ligne de cartes qui défile toute seule : la section met en valeur
 * les praticiens sans saturer la page. Emplacement commercialisé — seuls les
 * abonnés Premium et Pionnier y figurent (voir `spotlightLawyers`).
 */
export function LawyersSpotlight() {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="avocats-une">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Avocats à la une"
          title={
            <span id="avocats-une">Avocats Recommandés &amp; Partenaires</span>
          }
          description="Des professionnels vérifiés à votre écoute. Carte professionnelle et inscription au Barreau contrôlées avant publication."
        />
      </div>

      <AutoCarousel label="Avocats recommandés" className="mt-14">
        {spotlightLawyers.map((lawyer) => (
          <LawyerCard key={lawyer.slug} lawyer={lawyer} />
        ))}
      </AutoCarousel>

      <div className="container-page mt-10 flex justify-center">
        <Link
          href="/avocats"
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Voir les 7 000 avocats
          {/* Le libellé complet ne rentre pas sur les très petits écrans. */}
          <span className="hidden sm:inline">de l’annuaire</span>
          <IconChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function LawyerCard({ lawyer }: { lawyer: SpotlightLawyer }) {
  return (
    <li className="w-[17.5rem] shrink-0 sm:w-[19rem]">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-marine-950/6 transition-transform duration-300 hover:-translate-y-1">
        {/*
          Emplacement de la photo professionnelle (module 2.1, stockage S3/R2).
          En attendant les visuels réels, les initiales sur aplat marine tiennent
          la place au bon ratio : remplacer ce bloc par <Image fill /> suffira.
        */}
        <div className="relative aspect-5/4 overflow-hidden bg-linear-to-br from-marine-800 to-marine-950">
          <span
            className="absolute inset-0 grid place-items-center font-serif text-6xl font-bold text-gold-200/90"
            aria-hidden="true"
          >
            {lawyer.initials}
          </span>

          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-marine-950 uppercase shadow-gold">
            <IconBadgeCheck className="size-3.5" />
            Membre vérifié
          </span>

          {lawyer.online && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-marine-950/70 px-2.5 py-1 text-[0.7rem] font-semibold text-white backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-trust-400" />
              En ligne
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-lg/snug font-bold text-marine-950">
            {lawyer.name}
          </h3>

          {lawyer.plan === "pionnier" && (
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-500/10 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-gold-700 uppercase ring-1 ring-gold-500/30 ring-inset">
              <IconCrown className="size-3.5" />À la une
            </span>
          )}

          <p className="mt-3 text-sm font-medium text-marine-700">
            {lawyer.specialty}
          </p>

          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-marine-500">
            <IconMapPin className="size-3.5 shrink-0 text-gold-500" />
            {lawyer.city} · {lawyer.bar}
          </p>

          <Rating
            value={lawyer.rating}
            reviews={lawyer.reviews}
            className="mt-4"
            compact
          />

          <Link
            href={`/avocats/${lawyer.slug}`}
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              full: true,
              className: "mt-6 border-marine-950/15",
            })}
          >
            Voir le profil
          </Link>
        </div>
      </article>
    </li>
  );
}
