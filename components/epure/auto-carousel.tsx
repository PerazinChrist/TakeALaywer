"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

/** Vitesse du défilement, en pixels par image à 60 Hz (≈ 36 px/seconde). */
const DEFAULT_SPEED = 0.6;

/**
 * Carrousel à défilement continu.
 *
 * La liste est rendue deux fois côte à côte. Le défilement avance la position
 * image par image ; dès qu'il a parcouru la largeur de la première liste, on la
 * retranche : comme la seconde liste est identique, le raccord ne se voit pas
 * et le mouvement paraît sans fin.
 *
 * On avance `scrollLeft` plutôt qu'un `transform` pour garder le défilement
 * natif : la molette, le doigt et les flèches continuent de fonctionner, et le
 * mouvement se met en pause dès que la souris entre ou qu'une carte prend le
 * focus au clavier.
 */
export function AutoCarousel({
  children,
  label,
  speed = DEFAULT_SPEED,
  className,
}: {
  children: ReactNode;
  label: string;
  speed?: number;
  className?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const original = useRef<HTMLUListElement>(null);
  const duplicate = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  /** Largeur exacte d'un tour de boucle, mesurée entre les deux listes. */
  const loop = useRef(0);

  useEffect(() => {
    const el = viewport.current;
    const first = original.current;
    const second = duplicate.current;
    if (!el || !first || !second) return;

    const measure = () => {
      loop.current = second.offsetLeft - first.offsetLeft;
    };
    measure();

    // Les largeurs bougent au redimensionnement et au chargement des polices.
    const observer = new ResizeObserver(measure);
    observer.observe(first);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      // Onglet resté en arrière-plan : on plafonne l'écart pour éviter un bond.
      const delta = Math.min(now - previous, 50);
      previous = now;

      if (!paused.current && !reduced.matches && loop.current > 0) {
        el.scrollLeft += speed * (delta / (1000 / 60));
        if (el.scrollLeft >= loop.current) el.scrollLeft -= loop.current;
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [speed]);

  /** Flèches : avance ou recule d'une carte exactement. */
  const step = (direction: 1 | -1) => {
    const el = viewport.current;
    const first = original.current;
    if (!el || !first) return;

    const items = first.children;
    const distance =
      items.length > 1
        ? (items[1] as HTMLElement).offsetLeft -
          (items[0] as HTMLElement).offsetLeft
        : el.clientWidth * 0.8;

    // Reculer depuis le tout début : on saute d'abord un tour vers l'avant,
    // sinon le navigateur bute sur zéro et la boucle paraît finie.
    if (direction === -1 && el.scrollLeft < distance && loop.current > 0) {
      el.scrollLeft += loop.current;
    }

    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <Arrow direction="left" onClick={() => step(-1)} />
      <Arrow direction="right" onClick={() => step(1)} />

      {/*
        Le conteneur déborde volontairement de la grille : les cartes suivantes
        restent visibles en bord d'écran, ce qui montre que la ligne défile.
      */}
      {/*
        `relative` est indispensable : sans lui, un descendant en position
        absolue sans parent positionné (les libellés `sr-only` de Rating, par
        exemple) prend pour bloc conteneur le wrapper situé au-dessus. Il
        échappe alors au découpage, se place à des milliers de pixels sur la
        droite et fait déborder la page entière à l'horizontale.
      */}
      <div
        ref={viewport}
        className={cn(
          "scrollbar-none container-page relative flex gap-5 overflow-x-auto pb-2",
          className,
        )}
      >
        <ul ref={original} aria-label={label} className="flex shrink-0 gap-5">
          {children}
        </ul>

        {/* Copie retirée de l'arbre d'accessibilité et du parcours clavier :
            elle n'existe que pour masquer le raccord de la boucle. */}
        <ul
          ref={duplicate}
          inert
          aria-hidden="true"
          className="flex shrink-0 gap-5"
        >
          {children}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Flèches de défilement — desktop uniquement, le tactile utilise le doigt. */
function Arrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const left = direction === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={left ? "Précédent" : "Suivant"}
      className={cn(
        "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-marine-950/10 bg-white text-marine-800 shadow-card transition-colors lg:grid",
        "hover:border-gold-500 hover:text-gold-700",
        left ? "left-3 xl:left-6" : "right-3 xl:right-6",
      )}
    >
      {left ? (
        <IconChevronLeft className="size-5" />
      ) : (
        <IconChevronRight className="size-5" />
      )}
    </button>
  );
}
