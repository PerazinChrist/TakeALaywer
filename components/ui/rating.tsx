import { cn } from "@/lib/utils";
import { IconStar } from "@/components/ui/icons";

/** Note moyenne issue des avis certifies (module 8.1). */
export function Rating({
  value,
  reviews,
  className,
  compact = false,
}: {
  value: number;
  reviews?: number;
  className?: string;
  compact?: boolean;
}) {
  const rounded = Math.round(value);

  return (
    // `relative` borne le libellé `sr-only` ci-dessous, qui est en position
    // absolue : sans repère, il se positionnerait par rapport au premier
    // ancêtre positionné, hors du composant.
    <span className={cn("relative inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar
            key={i}
            className={cn("size-3.5", i <= rounded ? "text-gold-400" : "text-marine-200")}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-marine-900">
        {value.toFixed(1).replace(".", ",")}
      </span>
      {reviews !== undefined && (
        <span className="text-sm text-marine-500">
          {compact ? `(${reviews})` : `· ${reviews} avis`}
        </span>
      )}
      <span className="sr-only">
        Note de {value} sur 5{reviews !== undefined ? `, ${reviews} avis` : ""}
      </span>
    </span>
  );
}
