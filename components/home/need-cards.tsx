import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { needCards } from "@/lib/data/home";
import { facetMap } from "@/lib/utils";
import type { Facet } from "@/lib/api/public";
import {
  IconArrowRight,
  IconBriefcase,
  IconFileText,
  IconHeart,
  IconHome,
  IconLandPlot,
  IconUsers,
} from "@/components/ui/icons";

const icons = {
  briefcase: IconBriefcase,
  home: IconHome,
  users: IconUsers,
  heart: IconHeart,
  file: IconFileText,
  land: IconLandPlot,
} as const;

/**
 * Cards interactives par besoin direct — directive-ui.md § 1.
 *
 * Des situations de vie réelles plutôt qu'une liste déroulante de spécialités :
 * l'utilisateur se reconnaît en moins de 3 secondes. Les situations sont
 * éditoriales et restent en dur ; l'effectif d'avocats affiché sous chacune,
 * lui, vient du décompte réel des fiches publiées dans le domaine.
 */
export function NeedCards({ specialties }: { specialties: Facet[] }) {
  const counts = facetMap(specialties);

  return (
    <section className="bg-panel py-20 lg:py-28" aria-labelledby="besoins-titre">
      <div className="container-page">
        <SectionHeading
          eyebrow="Par situation"
          title={<span id="besoins-titre">Que se passe-t-il dans votre vie ?</span>}
          description="Choisissez la situation la plus proche de la vôtre. Nous vous orientons directement vers les avocats compétents et les guides utiles."
          action={
            <Link
              href="/besoin/nouveau"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-marine-900 hover:text-gold-600"
            >
              Ma situation n’est pas listée
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needCards.map((need) => {
            const Icon = icons[need.icon];
            const available = counts[need.specialty] ?? 0;

            return (
              <li key={need.slug}>
                <Link
                  href={`/besoin/nouveau?situation=${need.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-marine-950/8 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-700 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-white">
                    <Icon className="size-5.5" />
                  </span>

                  <h3 className="mt-5 font-serif text-lg/snug font-bold text-marine-950">
                    {need.title}
                  </h3>
                  <p className="mt-2 text-sm/relaxed text-marine-600">{need.hint}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-marine-950/6 pt-4">
                    <span className="text-sm font-medium text-marine-500">
                      <span className="font-bold text-trust-600">{available}</span>{" "}
                      {available > 1 ? "avocats" : "avocat"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-600">
                      Commencer
                      <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
