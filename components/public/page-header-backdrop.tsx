import type { CSSProperties } from "react";

/**
 * Décor photographique des en-têtes de page.
 *
 * Les bandeaux de titre étaient d'un blanc plat. La photographie y prend
 * maintenant toute la place, et c'est un voile marine — pas un lavis blanc —
 * qui rétablit le contraste : le texte de ces en-têtes passe donc en clair.
 *
 * Se superposent à l'image un voile uniforme — réglable par page, une
 * bibliothèque déjà sombre n'en demande aucun —, un dégradé latéral dense sous
 * la colonne de texte, et deux assises horizontales.
 *
 * Les réglages ne sont pas au jugé : chaque valeur a été descendue jusqu'au
 * point où le texte le plus exposé de chaque page reste au-dessus de 4,5:1
 * (AA), pour que l'image se donne à voir le plus possible sans passer sous ce
 * seuil. Les alléger davantage y ferait repasser le chapô.
 */
export function PageHeaderBackdrop({
  image,
  position = "center",
  veil = 0.14,
  priority = false,
}: {
  /** Chemin public de l'illustration. */
  image: string;
  /** Cadrage de l'image, en valeurs `object-position`. */
  position?: string;
  /** Densité du voile uniforme, de 0 à 1. À baisser sur une photo déjà sombre. */
  veil?: number;
  /**
   * L'image est le plus grand élément visible au chargement.
   *
   * À n'activer que sur les bandeaux réellement au-dessus de la ligne de
   * flottaison : la priorité n'a de valeur que si elle reste rare.
   */
  priority?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/*
       * Une balise `img`, et non plus un `background-image`.
       *
       * Une image de fond n'est découverte qu'après le téléchargement et
       * l'analyse de la feuille de styles : sur la bibliothèque, ce bandeau est
       * l'élément le plus grand de l'écran, et ce report coûtait environ une
       * seconde de LCP. Dans le balisage, l'analyseur préalable du navigateur la
       * voit dès le premier octet de HTML et la met en file immédiatement.
       *
       * `alt` vide et `aria-hidden` sur le conteneur : c'est un décor, il n'a
       * rien à annoncer à un lecteur d'écran.
       */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 size-full object-cover [filter:saturate(0.85)_contrast(1.1)]"
        style={{ objectPosition: position }}
      />

      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(15 23 42 / ${veil})` } as CSSProperties}
      />

      {/* Les paliers `lg:` calent la bascule sur ~64 % de la largeur, soit la
          fin du `max-w-3xl` du titre : au-delà, plus rien n'est écrit et
          l'image peut se donner à voir. */}
      <div className="absolute inset-0 bg-linear-to-r from-marine-950/88 via-marine-950/76 to-marine-950/60 lg:from-marine-950/88 lg:from-18% lg:via-marine-950/58 lg:via-64% lg:to-marine-950/8" />

      {/* La première assise a un palier plein : le sur-titre est le texte le
          plus petit du bandeau et tombe pile dans les hautes lumières d'une
          photo cadrée sur un ciel. Un simple dégradé y était déjà trop dilué.
          La seconde referme le bandeau et détache la carte de filtres blanche
          que l'annuaire et les guides font chevaucher sa bordure. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-marine-950/55 from-45% to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-marine-950/45 to-transparent" />

      {/* Halo or très diffus, côté image : il réchauffe le bandeau sans
          éclaircir la zone de texte. */}
      <div className="absolute -top-24 right-[6%] size-[24rem] rounded-full bg-gold-500/12 blur-[130px]" />
    </div>
  );
}
