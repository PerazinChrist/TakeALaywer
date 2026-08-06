import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { FilterBar, facetOptions } from "@/components/public/filter-bar";
import { Pagination } from "@/components/public/pagination";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { buttonStyles } from "@/components/ui/button";
import { fetchGuides } from "@/lib/api/public";
import { groupDigits } from "@/lib/utils";
import { IconArrowRight, IconFileText } from "@/components/ui/icons";

/** La bibliothèque change dès qu'un praticien publie ou dépublie un guide. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guides juridiques et modèles de documents",
  description:
    "Des guides pratiques et des modèles d’actes rédigés par des avocats inscrits au Barreau. Certains sont en lecture libre, les autres se débloquent dès 250 FCFA.",
  alternates: { canonical: "/guides" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORTS = [
  { value: "popular", label: "Les plus lus" },
  { value: "recent", label: "Les plus récents" },
  { value: "price", label: "Prix croissant" },
  { value: "title", label: "Ordre alphabétique" },
];

const ACCESS = [
  { value: "free", label: "Lecture libre" },
  { value: "premium", label: "À débloquer" },
];

const KINDS = [
  { value: "guide", label: "Guides" },
  { value: "modele", label: "Modèles d’actes" },
];

export default async function GuidesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const query = {
    search: single(params.q),
    category: single(params.domaine),
    kind: single(params.type),
    access: single(params.acces),
    author: single(params.auteur),
    sort: single(params.tri) || "popular",
    page: Math.max(1, Number.parseInt(single(params.page) || "1", 10) || 1),
  };

  const library = await fetchGuides({ ...query, facets: true, perPage: 12 });

  const hrefWith = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();

    const base: Record<string, string | number | undefined> = {
      q: query.search,
      domaine: query.category,
      type: query.kind,
      acces: query.access,
      auteur: query.author,
      tri: query.sort === "popular" ? undefined : query.sort,
      page: query.page > 1 ? query.page : undefined,
      ...changes,
    };

    for (const [key, value] of Object.entries(base)) {
      if (value === undefined || value === "") continue;

      next.set(key, String(value));
    }

    const search = next.toString();

    return search ? `/guides?${search}` : "/guides";
  };

  const activeFilters = [
    query.category && { label: query.category, href: hrefWith({ domaine: undefined, page: undefined }) },
    query.kind && {
      label: KINDS.find((entry) => entry.value === query.kind)?.label ?? query.kind,
      href: hrefWith({ type: undefined, page: undefined }),
    },
    query.access && {
      label: ACCESS.find((entry) => entry.value === query.access)?.label ?? query.access,
      href: hrefWith({ acces: undefined, page: undefined }),
    },
    query.author && { label: `Auteur : ${query.author}`, href: hrefWith({ auteur: undefined, page: undefined }) },
    query.search && { label: `« ${query.search} »`, href: hrefWith({ q: undefined, page: undefined }) },
  ].filter((filter): filter is { label: string; href: string } => Boolean(filter));

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          {/* Rayonnages d'ouvrages. La photographie est déjà sombre : aucun
              voile uniforme, sinon les rayonnages disparaissent. Le cadrage
              haut place les tranches claires à droite, hors du texte. */}
          <PageHeaderBackdrop
            image="/headers/guides.webp"
            position="center 30%"
            veil={0}
          />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Bibliothèque juridique
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
              Comprendre vos droits, sans rendez-vous
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              Chaque guide est écrit et signé par un avocat inscrit au Barreau.
              Les guides en lecture libre s’ouvrent en entier ; les autres
              laissent lire leur début avant de se débloquer.
            </p>
          </div>
        </header>

        {/* Voir `app/avocats/page.tsx` : sans `relative`, l'en-tête positionné
            ci-dessus recouvre la partie chevauchante de la carte de filtres. */}
        <div className="relative z-10 container-page -mt-8 pb-16">
          <FilterBar
            action="/guides"
            search={query.search}
            searchPlaceholder="Un mot-clé, un sujet, un nom d’avocat…"
            activeFilters={activeFilters}
            hiddenFields={query.author ? { auteur: query.author } : {}}
            selects={[
              {
                name: "domaine",
                label: "Domaine du droit",
                placeholder: "Tous les domaines",
                value: query.category,
                options: facetOptions(library.facets?.categories),
              },
              {
                name: "type",
                label: "Nature du document",
                placeholder: "Guides et modèles",
                value: query.kind,
                options: KINDS,
              },
              {
                name: "acces",
                label: "Accès",
                placeholder: "Tous les accès",
                value: query.access,
                options: ACCESS,
              },
            ]}
            sort={{
              name: "tri",
              label: "Trier les résultats",
              placeholder: "Les plus lus",
              value: query.sort,
              options: SORTS,
            }}
          />

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm text-marine-600" role="status">
              {library.total > 0 ? (
                <>
                  <span className="font-bold text-marine-950">{groupDigits(library.total)}</span>{" "}
                  {library.total > 1 ? "documents disponibles" : "document disponible"}
                </>
              ) : (
                "Aucun document ne correspond à votre recherche"
              )}
            </p>

            <nav className="flex flex-wrap gap-2" aria-label="Accès">
              <Link href={hrefWith({ acces: undefined, page: undefined })} className={pillStyles(!query.access)}>
                Tous
              </Link>
              {ACCESS.map((entry) => (
                <Link
                  key={entry.value}
                  href={hrefWith({ acces: entry.value, page: undefined })}
                  className={pillStyles(query.access === entry.value)}
                >
                  {entry.label}
                </Link>
              ))}
            </nav>
          </div>

          {library.items.length > 0 ? (
            <>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {library.items.map((guide) => (
                  <li key={guide.slug}>
                    <GuideShowcaseCard guide={guide} />
                  </li>
                ))}
              </ul>

              <Pagination
                page={library.page}
                pages={library.pages}
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
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400">
        <IconFileText className="size-6" />
      </span>

      <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
        {hasFilters ? "Aucun document avec ces critères" : "La bibliothèque se remplit"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
        {hasFilters
          ? "Retirez un filtre pour élargir la recherche, ou posez directement votre question à un avocat."
          : "Aucun guide n’est publié pour l’instant. Les praticiens vérifiés peuvent publier depuis leur espace."}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <Link href="/guides" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Réinitialiser les filtres
          </Link>
        )}
        <Link href="/besoin/nouveau" className={buttonStyles({ size: "sm" })}>
          Poser ma question
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function pillStyles(active: boolean) {
  return active
    ? "rounded-full bg-marine-950 px-4 py-1.5 text-sm font-semibold text-white"
    : "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-marine-700 ring-1 ring-marine-950/8 ring-inset transition-colors hover:bg-gold-50 hover:text-gold-700";
}

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
