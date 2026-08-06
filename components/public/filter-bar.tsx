import { buttonStyles } from "@/components/ui/button";
import type { Facet } from "@/lib/api/public";
import { IconChevronDown, IconClose, IconSearch } from "@/components/ui/icons";
import Link from "next/link";

export type FilterOption = {
  /** Ce qui part dans l'URL. */
  value: string;
  /** Ce que lit l'utilisateur. */
  label: string;
  /** Effectif réel, affiché entre parenthèses quand il est connu. */
  total?: number;
};

export type FilterSelect = {
  /** Nom du paramètre d'URL, en français : « domaine », « ville »… */
  name: string;
  label: string;
  placeholder: string;
  value: string;
  options: FilterOption[];
};

/** Convertit les facettes de l'API en options de filtre. */
export function facetOptions(facets: Facet[] | undefined): FilterOption[] {
  return (facets ?? []).map((facet) => ({
    value: facet.value,
    label: facet.value,
    total: facet.total,
  }));
}

/**
 * Barre de filtres des pages d'index.
 *
 * Un formulaire GET, sans une ligne de JavaScript : la page reste utilisable
 * avant l'hydratation, chaque combinaison de filtres possède une URL propre —
 * donc partageable et indexable — et le bouton « précédent » du navigateur se
 * comporte comme l'utilisateur l'attend. Un filtre piloté par l'état React
 * aurait coûté les trois.
 */
export function FilterBar({
  action,
  search,
  searchPlaceholder,
  selects,
  sort,
  hiddenFields = {},
  activeFilters = [],
}: {
  /** Chemin cible du formulaire. */
  action: string;
  search: string;
  searchPlaceholder: string;
  selects: FilterSelect[];
  sort?: FilterSelect;
  /** Paramètres à conserver sans les afficher. */
  hiddenFields?: Record<string, string>;
  /** Filtres actifs, avec le lien qui les retire un par un. */
  activeFilters?: { label: string; href: string }[];
}) {
  return (
    // `relative` : la carte chevauche le bandeau de titre des pages d'index, et
    // un bloc statique passerait sous un en-tête lui-même positionné.
    <div className="relative rounded-3xl bg-white p-5 shadow-card ring-1 ring-marine-950/6 sm:p-6">
      <form action={action} method="get" className="flex flex-col gap-3">
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <label htmlFor="filtre-q" className="sr-only">
              Rechercher
            </label>
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gold-500">
              <IconSearch className="size-4.5" />
            </span>
            <input
              id="filtre-q"
              name="q"
              type="search"
              defaultValue={search}
              placeholder={searchPlaceholder}
              className="h-13 w-full rounded-2xl border border-marine-200 bg-white pr-4 pl-12 text-[0.95rem] text-marine-900 transition-colors hover:border-marine-300 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <button type="submit" className={buttonStyles({ size: "md" })}>
            <IconSearch className="size-4.5" />
            Rechercher
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {selects.map((select) => (
            <Select key={select.name} select={select} />
          ))}

          {sort && <Select select={sort} />}
        </div>

        {/* Toute nouvelle recherche repart de la première page : conserver le
            numéro courant afficherait « aucun résultat » sur un filtre qui en a
            douze. */}
        <noscript>
          <p className="text-xs text-marine-500">
            Validez avec le bouton « Rechercher » pour appliquer les filtres.
          </p>
        </noscript>
      </form>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-marine-950/6 pt-4">
          <span className="text-sm text-marine-500">Filtres actifs :</span>

          {activeFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-marine-50 px-3 py-1.5 text-sm font-medium text-marine-700 transition-colors hover:bg-gold-50 hover:text-gold-700"
            >
              {filter.label}
              <IconClose className="size-3.5 text-marine-400 group-hover:text-gold-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({ select }: { select: FilterSelect }) {
  return (
    <div className="relative">
      <label htmlFor={`filtre-${select.name}`} className="sr-only">
        {select.label}
      </label>
      <select
        id={`filtre-${select.name}`}
        name={select.name}
        defaultValue={select.value}
        className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-marine-200 bg-white pr-10 pl-4 text-sm font-medium text-marine-900 transition-colors hover:border-marine-300 focus:border-gold-500 focus:outline-none"
      >
        <option value="">{select.placeholder}</option>

        {select.options.map((option) => (
          <option key={option.value} value={option.value}>
            {/* L'effectif entre parenthèses évite de sélectionner un filtre qui
                ne renvoie rien : l'information existe, autant la donner. */}
            {option.total === undefined ? option.label : `${option.label} (${option.total})`}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-marine-400" />
    </div>
  );
}
