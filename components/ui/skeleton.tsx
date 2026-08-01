import { cn } from "@/lib/utils";

/**
 * Skeleton loader — directive-ui.md § 5.
 * Donne une impression d'instantanéité pendant le calcul ou le chargement.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden="true" />;
}

/** Squelette de l'orientation du diagnostic. */
export function OrientationSkeleton() {
  return (
    <div className="mt-7 space-y-4" role="status" aria-live="polite">
      <span className="sr-only">Analyse de votre situation en cours…</span>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-7 w-4/5" />
      <Skeleton className="h-7 w-2/5" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex gap-2.5 pt-2">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}
