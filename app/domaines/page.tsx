import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { practiceAreas } from "@/lib/data/practice-areas";
import { facetMap } from "@/lib/utils";
import { fetchHome } from "@/lib/api/public";
import { IconArrowRight, IconFileText, IconUsers } from "@/components/ui/icons";

/** Les effectifs par domaine viennent de la base. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Les domaines du droit",
  description:
    "Droit des affaires, du travail, de la famille, foncier, pénal, fiscal : trouvez le domaine qui correspond à votre situation et les avocats qui le pratiquent.",
  path: "/domaines",
});

export default async function DomainesPage() {
  const home = await fetchHome();
  const counts = facetMap(home.facets.specialties);

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase">
              Domaines du droit
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-marine-950 sm:text-4xl/tight lg:text-5xl/tight">
              Votre situation relève forcément d’un domaine
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-600">
              Vous n’avez pas à le deviner : chaque page décrit les situations
              concrètes qu’elle recouvre. Reconnaissez la vôtre, et vous saurez à
              qui vous adresser.
            </p>
          </div>
        </header>

        <div className="container-page py-12 lg:py-16">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => {
              const lawyers = counts[area.specialty] ?? 0;

              return (
                <li key={area.slug}>
                  <Link
                    href={`/domaines/${area.slug}`}
                    className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-marine-950/6 transition-all duration-300 hover:-translate-y-1 hover:ring-gold-500/35"
                  >
                    <h2 className="font-serif text-xl/snug font-bold text-marine-950 group-hover:text-gold-700">
                      {area.title}
                    </h2>
                    <p className="mt-2 flex-1 text-[0.95rem]/relaxed text-marine-600">
                      {area.tagline}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-marine-950/6 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-marine-500">
                        <IconUsers className="size-4 text-gold-500" />
                        {lawyers} {lawyers > 1 ? "praticiens" : "praticien"}
                      </span>
                      <IconArrowRight className="size-4 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 flex flex-wrap items-center gap-2 text-sm text-marine-600">
            <IconFileText className="size-4 text-marine-400" />
            Vous ne trouvez pas votre situation ?
            <Link href="/besoin/nouveau" className="font-semibold text-gold-700 hover:underline">
              Décrivez-la en trois minutes
            </Link>
            — nous identifions le domaine pour vous.
          </p>
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
