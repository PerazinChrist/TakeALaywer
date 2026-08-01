import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
} as const;

/**
 * Avatar par initiales.
 * Les photos reelles viendront du stockage S3 / R2 (module 2.1) ; en attendant,
 * les initiales evitent toute dependance reseau et tout decalage de mise en page.
 */
export function Avatar({
  initials,
  size = "md",
  online,
  className,
}: {
  initials: string;
  size?: keyof typeof sizes;
  online?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-linear-to-br from-marine-800 to-marine-950 font-semibold text-gold-200 ring-1 ring-marine-950/10",
          sizes[size],
        )}
      >
        {initials}
      </span>

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
