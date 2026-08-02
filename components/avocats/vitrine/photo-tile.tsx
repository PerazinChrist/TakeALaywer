import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/data/lawyer-profile";
import { IconImage } from "@/components/ui/icons";

/**
 * Emplacement d'une photo de la galerie.
 *
 * Deux états : la photo téléversée, servie depuis la médiathèque WordPress, ou
 * — tant qu'aucun fichier n'existe — un aplat dégradé au bon ratio, avec la
 * légende en surimpression. Le second n'est pas un placeholder de développement
 * mais l'état normal d'une vitrine qui vient d'être créée : elle doit rester
 * présentable avant que le praticien n'ait rien déposé.
 */
export const toneGradient: Record<Tone, string> = {
  marine: "from-marine-600 via-marine-800 to-marine-950",
  night: "from-marine-800 via-marine-950 to-marine-950",
  gold: "from-gold-300 via-gold-500 to-gold-700",
  trust: "from-trust-400 via-trust-500 to-trust-600",
  sand: "from-gold-100 via-gold-200 to-gold-400",
};

export function PhotoTile({
  caption,
  tone,
  url,
  className,
  showCaption = true,
  overlay,
  priority = false,
}: {
  caption: string;
  tone: Tone;
  /** Visuel téléversé. Absent, l'aplat dégradé prend le relais. */
  url?: string | null;
  className?: string;
  showCaption?: boolean;
  /** Contenu posé par-dessus la tuile (compteur « +4 », actions de gestion…). */
  overlay?: React.ReactNode;
  /** Charge l'image sans attendre — pour les vignettes visibles d'emblée. */
  priority?: boolean;
}) {
  const light = tone === "sand" || tone === "gold";

  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl bg-linear-to-br",
        toneGradient[tone],
        className,
      )}
    >
      {url ? (
        // `<img>` et non `<Image>` : la source est l'installation WordPress du
        // client, dont le domaine varie d'un déploiement à l'autre. L'optimiseur
        // de Next exige une liste d'hôtes figée à la compilation, qu'on ne peut
        // pas connaître ici.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={caption}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <IconImage
          className={cn(
            "absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2",
            light ? "text-marine-950/20" : "text-white/20",
          )}
          aria-hidden="true"
        />
      )}

      {showCaption && caption && (
        <>
          <span
            className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-marine-950/75 to-transparent"
            aria-hidden="true"
          />
          <span className="absolute inset-x-0 bottom-0 p-3 text-xs/snug font-medium text-white">
            {caption}
          </span>
        </>
      )}

      {overlay}
    </div>
  );
}
