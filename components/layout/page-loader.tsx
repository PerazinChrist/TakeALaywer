import { Skeleton } from "@/components/ui/skeleton";
import { IconScale } from "@/components/ui/icons";

/**
 * Écran d'attente commun à toutes les pages.
 *
 * Next.js remplace la page entière par ce composant pendant qu'elle se rend —
 * en-tête compris, puisque chaque page monte le sien plutôt que de le tenir
 * d'un layout. D'où la barre reconstituée à l'identique ici : sans elle, le
 * logo disparaîtrait à chaque navigation et reviendrait une demi-seconde plus
 * tard, ce qui se lit comme un rechargement complet du site.
 *
 * Le reste est un squelette de la structure la plus fréquente — bandeau de
 * titre sombre, puis grille de cartes. Il ne prétend pas décrire chaque page :
 * son rôle est de réserver la place et de tenir le regard, pas de deviner le
 * contenu à venir.
 *
 * L'animation s'arrête d'elle-même sous `prefers-reduced-motion` : la règle
 * globale de `globals.css` ramène toutes les durées à 0,01 ms.
 */
export function PageLoader({ label = "Chargement de la page…" }: { label?: string }) {
  return (
    <div className="min-h-screen bg-panel" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>

      {/* Barre de progression, au-dessus de tout le reste. */}
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-marine-950/8"
        aria-hidden="true"
      >
        <div className="animate-loader-sweep h-full w-1/4 rounded-full bg-linear-to-r from-gold-400 to-gold-600" />
      </div>

      {/* En-tête factice, au gabarit exact du vrai (h-20, fond `bg-panel`). */}
      <div className="border-b border-marine-950/6 bg-panel/85 backdrop-blur-md" aria-hidden="true">
        <div className="container-page flex h-20 items-center justify-between gap-4 lg:gap-12">
          <span className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-gold-400 to-gold-600 text-white shadow-gold">
              <IconScale className="size-5.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-marine-950 max-[360px]:hidden">
              Take<span className="text-gold-500">A</span>Lawyer
            </span>
          </span>

          <span className="hidden items-center gap-6 lg:flex">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </span>

          <Skeleton className="h-9 w-32 shrink-0 rounded-full" />
        </div>
      </div>

      {/* Bandeau de titre. Les blocs y sont en blanc translucide : le squelette
          clair du reste de la page serait invisible sur ce fond marine. */}
      <div className="border-b border-marine-950/8 bg-marine-950" aria-hidden="true">
        <div className="container-page py-14 lg:py-20">
          <div className="h-3 w-28 rounded-full bg-gold-400/40" />
          <div className="mt-5 h-9 w-full max-w-xl rounded-lg bg-white/12" />
          <div className="mt-3 h-9 w-2/3 max-w-md rounded-lg bg-white/12" />
          <div className="mt-6 h-4 w-full max-w-lg rounded bg-white/8" />
        </div>
      </div>

      {/* Corps de page. */}
      <div className="container-page py-12 lg:py-16" aria-hidden="true">
        <Skeleton className="h-20 w-full rounded-3xl" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Trois cartes suffisent : au-delà, le squelette occupe plus d'écran
              que la page ne rendra au premier coup d'œil. */}
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6"
            >
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="mt-5 h-3 w-24" />
              <Skeleton className="mt-3 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-3/4" />
              <div className="mt-5 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <Skeleton className="mt-6 h-11 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
