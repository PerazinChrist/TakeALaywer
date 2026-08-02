import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
} as const;

/**
 * Avatar : portrait téléversé, ou initiales à défaut.
 *
 * Les initiales ne sont pas un pis-aller de développement — une vitrine reste
 * parfaitement présentable sans photo, et beaucoup de praticiens n'en déposent
 * jamais. Elles évitent au passage toute requête réseau et tout décalage de
 * mise en page pendant le chargement.
 */
export function Avatar({
  initials,
  imageUrl,
  size = "md",
  online,
  className,
}: {
  initials: string;
  /** Portrait téléversé, servi par la médiathèque WordPress. */
  imageUrl?: string | null;
  size?: keyof typeof sizes;
  online?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {imageUrl ? (
        // `<img>` et non `<Image>` : le domaine WordPress varie d'un
        // déploiement à l'autre, or l'optimiseur de Next exige une liste
        // d'hôtes connue à la compilation.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={initials}
          decoding="async"
          className={cn(
            "inline-block rounded-full object-cover ring-1 ring-marine-950/10",
            sizes[size],
          )}
        />
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-linear-to-br from-marine-800 to-marine-950 font-semibold text-gold-200 ring-1 ring-marine-950/10",
            sizes[size],
          )}
        >
          {initials}
        </span>
      )}

      {online !== undefined && (
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-white",
            online ? "bg-trust-500" : "bg-marine-300",
          )}
        >
          <span className="sr-only">{online ? "En ligne" : "Hors ligne"}</span>
        </span>
      )}
    </span>
  );
}
