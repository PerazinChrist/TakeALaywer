import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { LawyerCard } from "@/components/public/lawyer-card";
import { FilterBar, facetOptions } from "@/components/public/filter-bar";
import { Pagination } from "@/components/public/pagination";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, directoryPaths, itemListLd } from "@/lib/seo/structured-data";
import { fetchDirectory } from "@/lib/api/public";
import { groupDigits } from "@/lib/utils";
import { IconArrowRight, IconSearch } from "@/components/ui/icons";

/** L'annuaire change dès qu'une vitrine est publiée ou suspendue. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Annuaire des avocats et cabinets vérifiés",
  description:
    "Trouvez un avocat ou un cabinet inscrit au Barreau : filtrez par domaine du droit, ville et barreau. Carte professionnelle contrôlée avant publication.",
  alternates: { canonical: "/avocats" },
};

/**
 * Paramètres de l'URL.
 *
 * Ils sont en français et lisibles : `/avocats?domaine=Droit du travail&ville=Douala`
 * se comprend sans documentation, se partage et s'indexe. C'est aussi ce que
 * construisent déjà le pied de page, la bande de recherche et le diagnostic.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORTS = [
  { value: "featured", label: "Pertinence" },
  { value: "rating", label: "Meilleures notes" },
  { value: "reviews", label: "Plus d’avis" },
  { value: "recent", label: "Inscriptions récentes" },
  { value: "name", label: "Ordre alphabétique" },
];

const TYPES = [
  { value: "individuel", label: "Avocat indépendant" },
  { value: "cabinet", label: "Cabinet" },
];

export default async function AvocatsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const query = {
    search: single(params.q),
    specialty: single(params.domaine),
    city: single(params.ville),
    bar: single(params.barreau),
    type: single(params.type),
    sort: single(params.tri) || "featured",
    page: Math.max(1, Number.parseInt(single(params.page) || "1", 10) || 1),
  };

  const directory = await fetchDirectory({ ...query, facets: true, perPage: 12 });
  const facets = directory.facets;

  /** Reconstruit l'URL courante en changeant une seule clé. */
  const hrefWith = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();

    const base: Record<string, string | number | undefined> = {
      q: query.search,
      domaine: query.specialty,
      ville: query.city,
      barreau: query.bar,
      type: query.type,
      tri: query.sort === "featured" ? undefined : query.sort,
      page: query.page > 1 ? query.page : undefined,
      ...changes,
    };

    for (const [key, value] of Object.entries(base)) {
      if (value === undefined || value === "" ) continue;

      next.set(key, String(value));
    }

    const search = next.toString();

    return search ? `/avocats?${search}` : "/avocats";
  };

  const activeFilters = [
    query.specialty && { label: query.specialty, href: hrefWith({ domaine: undefined, page: undefined }) },
    query.city && { label: query.city, href: hrefWith({ ville: undefined, page: undefined }) },
    query.bar && { label: query.bar, href: hrefWith({ barreau: undefined, page: undefined }) },
    query.type && {
      label: TYPES.find((entry) => entry.value === query.type)?.label ?? query.type,
      href: hrefWith({ type: undefined, page: undefined }),
    },
    query.search && { label: `« ${query.search} »`, href: hrefWith({ q: undefined, page: undefined }) },
  ].filter((filter): filter is { label: string; href: string } => Boolean(filter));

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          {/* Façade néoclassique. Le cadrage à mi-hauteur est le seul qui
              donne à la fois des colonnes lisibles et un coin haut-gauche assez
              sourd pour le sur-titre : plus haut, on ne voit qu'un ciel plat. */}
          <PageHeaderBackdrop
            image="/headers/avocats.webp"
            position="center 45%"
          />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Annuaire vérifié
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
              Trouvez l’avocat ou le cabinet qu’il vous faut
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              Chaque fiche a été contrôlée avant publication : carte
              professionnelle, inscription au Barreau et pièce d’identité. Les
              honoraires indicatifs figurent sur chaque profil.
            </p>
          </div>
        </header>

        {/* `relative` n'est pas décoratif : l'en-tête ci-dessus est positionné,
            donc peint après ce bloc statique et recouvrirait les deux
            centimètres de carte que le `-mt-8` fait chevaucher. Positionner le
            conteneur le remet dans l'ordre du document. */}
        <div className="relative z-10 container-page -mt-8 pb-16">
          <FilterBar
            action="/avocats"
            search={query.search}
            searchPlaceholder="Nom, cabinet, ville ou spécialité…"
            activeFilters={activeFilters}
            // Le type de compte se règle par les pastilles, hors du formulaire :
            // sans ce champ caché, lancer une recherche l'effacerait
            // silencieusement.
            hiddenFields={query.type ? { type: query.type } : {}}
            selects={[
              {
                name: "domaine",
                label: "Domaine du droit",
                placeholder: "Tous les domaines",
                value: query.specialty,
                options: facetOptions(facets?.specialties),
              },
              {
                name: "ville",
                label: "Ville",
                placeholder: "Toutes les villes",
                value: query.city,
                options: facetOptions(facets?.cities),
              },
              {
                name: "barreau",
                label: "Barreau",
                placeholder: "Tous les barreaux",
                value: query.bar,
                options: facetOptions(facets?.bars),
              },
            ]}
            sort={{
              name: "tri",
              label: "Trier les résultats",
              placeholder: "Pertinence",
              value: query.sort,
              options: SORTS,
            }}
          />

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm text-marine-600" role="status">
              {directory.total > 0 ? (
                <>
                  <span className="font-bold text-marine-950">
                    {groupDigits(directory.total)}
                  </span>{" "}
                  {directory.total > 1 ? "profils correspondent" : "profil correspond"} à
                  votre recherche
                </>
              ) : (
                "Aucun profil ne correspond à votre recherche"
              )}
            </p>

            <nav className="flex flex-wrap gap-2" aria-label="Type de compte">
              <Link
                href={hrefWith({ type: undefined, page: undefined })}
                className={pillStyles(!query.type)}
              >
                Tous
              </Link>
              {TYPES.map((entry) => (
                <Link
                  key={entry.value}
                  href={hrefWith({ type: entry.value, page: undefined })}
                  className={pillStyles(query.type === entry.value)}
                >
                  {entry.label}
                </Link>
              ))}
            </nav>
          </div>

          {directory.items.length > 0 ? (
            <>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {directory.items.map((lawyer) => (
                  <LawyerCard key={lawyer.slug} lawyer={lawyer} />
                ))}
              </ul>

              <Pagination
                page={directory.page}
                pages={directory.pages}
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

      {/* La liste dit au moteur que cette page est un point d'entrée vers des
          vitrines, et lui en donne l'ordre — sans quoi il doit le deviner. */}
      <JsonLd
        data={[
          itemListLd("Annuaire des avocats et cabinets", directoryPaths(directory.items)),
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Avocats", path: "/avocats" },
          ]),
        ]}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-marine-300 bg-white px-6 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400">
        <IconSearch className="size-6" />
      </span>

      <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
        {hasFilters ? "Aucun profil avec ces critères" : "L’annuaire est encore vide"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
        {hasFilters
          ? "Élargissez la recherche en retirant un filtre, ou déposez votre besoin : il sera acheminé vers les avocats compétents, où qu’ils exercent."
          : "Aucune vitrine n’est publiée pour le moment. Les fiches paraissent une fois les justificatifs vérifiés."}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <Link href="/avocats" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Réinitialiser les filtres
          </Link>
        )}
        <Link href="/besoin/nouveau" className={buttonStyles({ size: "sm" })}>
          Déposer mon besoin
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

/** Un paramètre d'URL répété (`?ville=A&ville=B`) ne doit pas casser le filtre. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
