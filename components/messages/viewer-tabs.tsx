import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/lib/api/desk";
import { IconScale, IconUser } from "@/components/ui/icons";

/**
 * Bascule entre les deux versants d'un même écran.
 *
 * Elle n'a de sens que lorsque les deux sessions sont ouvertes dans le même
 * navigateur — c'est le cas de tout avocat qui possède aussi un compte citoyen.
 * L'appelant décide de l'afficher ; ce composant ne fait que la rendre.
 *
 * Des liens et non des boutons : chaque versant a son URL, donc son signet et
 * son bouton « précédent ».
 */
export function ViewerTabs({
  current,
  base,
  className,
}: {
  current: Viewer;
  /** Chemin sans paramètre, ex. « /messages ». */
  base: string;
  className?: string;
}) {
  const tabs = [
    { viewer: "client" as const, param: "citoyen", label: "Espace citoyen", Icon: IconUser },
    { viewer: "account" as const, param: "avocat", label: "Espace praticien", Icon: IconScale },
  ];

  return (
    <nav className={cn("flex flex-wrap gap-2", className)} aria-label="Profil consulté">
      {tabs.map(({ viewer, param, label, Icon }) => {
        const active = viewer === current;

        return (
          <Link
            key={viewer}
            href={`${base}?profil=${param}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-marine-950 text-white"
                : "bg-white text-marine-700 ring-1 ring-marine-950/8 ring-inset hover:bg-gold-50 hover:text-gold-700",
            )}
          >
            <Icon className={cn("size-4", active ? "text-gold-400" : "text-marine-400")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
