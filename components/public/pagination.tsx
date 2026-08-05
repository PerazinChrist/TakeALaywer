import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

/**
 * Pagination en liens, pas en boutons.
 *
 * Chaque page est une URL réelle : elle s'ouvre dans un nouvel onglet, se
 * partage, s'indexe, et survit à un rechargement. Une pagination pilotée par
 * l'état du navigateur perd tout cela pour n'économiser qu'un aller-retour.
 */
export function Pagination({
  page,
  pages,
  buildHref,
}: {
  page: number;
  pages: number;
  /** Construit l'URL d'une page en conservant les filtres courants. */
  buildHref: (page: number) => string;
}) {
  if (pages <= 1) return null;

  const numbers = pageNumbers(page, pages);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Step
        href={buildHref(page - 1)}
        disabled={page <= 1}
        label="Page précédente"
        icon={<IconChevronLeft className="size-4" />}
      />

      {numbers.map((number, index) =>
        number === null ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1.5 text-sm text-marine-400"
          >
            …
          </span>
        ) : (
          <Link
            key={number}
            href={buildHref(number)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-xl text-sm font-semibold transition-colors",
              number === page
                ? "bg-marine-950 text-white"
                : "bg-white text-marine-700 ring-1 ring-marine-950/8 ring-inset hover:bg-gold-50 hover:text-gold-700",
            )}
          >
            {number}
          </Link>
        ),
      )}

      <Step
        href={buildHref(page + 1)}
        disabled={page >= pages}
        label="Page suivante"
        icon={<IconChevronRight className="size-4" />}
      />
    </nav>
  );
}

function Step({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  // Un lien désactivé n'est pas un lien : rendre un <span> évite qu'il reçoive
  // le focus au clavier et qu'un lecteur d'écran l'annonce comme cliquable.
  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-xl text-marine-300"
      >
        {icon}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-10 place-items-center rounded-xl bg-white text-marine-700 ring-1 ring-marine-950/8 ring-inset transition-colors hover:bg-gold-50 hover:text-gold-700"
    >
      {icon}
    </Link>
  );
}

/**
 * Construit la suite de numéros affichés, avec des ellipses.
 *
 * `null` marque une coupure. Au-delà de sept pages, tout afficher déborderait
 * sur mobile.
 */
function pageNumbers(page: number, pages: number): (number | null)[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  const numbers = new Set<number>([1, pages, page]);

  if (page > 1) numbers.add(page - 1);
  if (page < pages) numbers.add(page + 1);

  const sorted = [...numbers].sort((a, b) => a - b);
  const output: (number | null)[] = [];

  for (const [index, number] of sorted.entries()) {
    if (index > 0 && number - sorted[index - 1] > 1) output.push(null);

    output.push(number);
  }

  return output;
}
