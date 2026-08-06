import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { FilterBar, facetOptions } from "@/components/public/filter-bar";
import { Pagination } from "@/components/public/pagination";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { NeedCard } from "@/components/communaute/need-card";
import { buttonStyles } from "@/components/ui/button";
import { fetchNeeds } from "@/lib/api/community";
import { groupDigits } from "@/lib/utils";
import { IconArrowRight, IconSend, IconUsers } from "@/components/ui/icons";

/** Un problème publié doit apparaître à la seconde suivante. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Espace communautaire — problèmes juridiques et réponses",
  description:
    "Les problèmes juridiques posés par les membres et les réponses reçues, dont celles d’avocats vérifiés. Consultation libre, sans compte.",
  alternates: { canonical: "/communaute" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORTS = [
  { value: "recent", label: "Les plus récents" },
  { value: "active", label: "Derniers échanges" },
  { value: "utiles", label: "Les plus utiles" },
  { value: "vues", label: "Les plus consultés" },
  { value: "sans_reponse", label: "Sans réponse" },
];

const STATUSES = [
  { value: "ouvert", label: "Ouverts" },
  { value: "resolu", label: "Résolus" },
];

export default async function CommunautePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const query = {
    search: single(params.q),
    specialty: single(params.domaine),
    city: single(params.ville),
    status: single(params.etat),
    sort: single(params.tri) || "recent",
    page: Math.max(1, Number.parseInt(single(params.page) || "1", 10) || 1),
  };

  const board = await fetchNeeds({ ...query, facets: true, perPage: 12 });

  /** Reconstruit l'URL courante en changeant une seule clé. */
  const hrefWith = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();

    const base: Record<string, string | number | undefined> = {
      q: query.search,
      domaine: query.specialty,
      ville: query.city,
      etat: query.status,
      tri: query.sort === "recent" ? undefined : query.sort,
      page: query.page > 1 ? query.page : undefined,
      ...changes,
    };

    for (const [key, value] of Object.entries(base)) {
      if (value === undefined || value === "") continue;

      next.set(key, String(value));
    }

    const search = next.toString();

    return search ? `/communaute?${search}` : "/communaute";
  };

  const activeFilters = [
    query.specialty && { label: query.specialty, href: hrefWith({ domaine: undefined, page: undefined }) },
    query.city && { label: query.city, href: hrefWith({ ville: undefined, page: undefined }) },
    query.status && {
      label: STATUSES.find((entry) => entry.value === query.status)?.label ?? query.status,
      href: hrefWith({ etat: undefined, page: undefined }),
    },
    query.search && { label: `« ${query.search} »`, href: hrefWith({ q: undefined, page: undefined }) },
  ].filter((filter): filter is { label: string; href: string } => Boolean(filter));

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          <PageHeaderBackdrop image="/headers/guides.webp" position="center 30%" veil={0.12} />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Espace communautaire
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
              Les problèmes posés, et ce qu’on y a répondu
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              Chacun peut répondre. Quand la réponse vient d’un avocat inscrit au
              Barreau et vérifié par nos soins, elle porte son badge. Lecture
              libre, sans compte.
            </p>

            <Link href="/besoin/nouveau" className={buttonStyles({ size: "md", className: "mt-7" })}>
              <IconSend className="size-4" />
              Poser mon problème
            </Link>
          </div>
        </header>

        {/* Voir `app/avocats/page.tsx` : sans `relative`, l'en-tête positionné
            ci-dessus recouvre la partie chevauchante de la carte de filtres. */}
        <div className="relative z-10 container-page -mt-8 pb-16">
          <FilterBar
            action="/communaute"
            search={query.search}
            searchPlaceholder="Un mot-clé, une situation…"
            activeFilters={activeFilters}
            selects={[
              {
                name: "domaine",
                label: "Domaine du droit",
                placeholder: "Tous les domaines",
                value: query.specialty,
                options: facetOptions(board.facets?.specialties),
              },
              {
                name: "ville",
                label: "Ville",
                placeholder: "Toutes les villes",
                value: query.city,
                options: facetOptions(board.facets?.cities),
              },
              {
                name: "etat",
                label: "État du fil",
                placeholder: "Tous les fils",
                value: query.status,
                options: STATUSES,
              },
            ]}
            sort={{
              name: "tri",
              label: "Trier les problèmes",
              placeholder: "Les plus récents",
              value: query.sort,
              options: SORTS,
            }}
          />

          <p className="mt-6 text-sm text-marine-600" role="status">
            {board.total > 0 ? (
              <>
                <span className="font-bold text-marine-950">{groupDigits(board.total)}</span>{" "}
                {board.total > 1 ? "problèmes correspondent" : "problème correspond"} à votre
                recherche
              </>
            ) : (
              "Aucun problème ne correspond à votre recherche"
            )}
          </p>

          {board.items.length > 0 ? (
            <>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {board.items.map((need) => (
                  <li key={need.slug} className="flex">
                    <NeedCard need={need} />
                  </li>
                ))}
              </ul>

              <Pagination
                page={board.page}
                pages={board.pages}
                buildHref={(page) => hrefWith({ page: page > 1 ? page : undefined })}
              />
            </>
          ) : (
            <EmptyState hasFilters={activeFilters.length > 0} />
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-marine-300 bg-white px-6 py-16 text-center">
      <span
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconUsers className="size-6" />
      </span>

      <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
        {hasFilters ? "Aucun problème avec ces critères" : "L’espace communautaire démarre"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
        {hasFilters
          ? "Élargissez la recherche en retirant un filtre, ou posez votre propre problème : il sera lu par les membres et par les avocats vérifiés."
          : "Personne n’a encore publié de problème. Soyez le premier — votre question servira à ceux qui la vivront après vous."}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <Link href="/communaute" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Réinitialiser les filtres
          </Link>
        )}
        <Link href="/besoin/nouveau" className={buttonStyles({ size: "sm" })}>
          Poser mon problème
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

/** Un paramètre d'URL répété (`?ville=A&ville=B`) ne doit pas casser le filtre. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
