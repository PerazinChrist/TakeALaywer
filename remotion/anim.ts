/**
 * Helpers d'animation partages par les scenes.
 *
 * Tout passe par `spring()` plutot que par des `interpolate` lineaires : un
 * ressort critique donne une arrivee qui decelere, ce que l'oeil lit comme
 * « pose » plutot que « projete ». C'est exactement la courbe
 * `cubic-bezier(0.16, 1, 0.3, 1)` utilisee par `--animate-fade-up` sur le
 * site, exprimee cette fois en physique plutot qu'en bezier.
 */
import type { CSSProperties } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Entree « fade + montee », l'animation de base de toute la video.
 *
 * @param delay  Retard en images. C'est lui qui cree les cascades : trois
 *               cartes a 0 / 8 / 16 se lisent comme une liste qui se remplit,
 *               les memes trois cartes a 0 se lisent comme un bloc qui saute.
 * @param distance Amplitude de la montee, en pixels.
 */
export const useReveal = (delay = 0, distance = 46): CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.8 },
  });

  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * distance}px)`,
  };
};

/**
 * Variante avec un leger depassement, reservee aux elements qui doivent
 * « claquer » : le bouton final, les pastilles flottantes. A utiliser avec
 * parcimonie — un rebond partout donne une pub de jouet, pas de cabinet.
 */
export const usePop = (delay = 0): CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });

  return {
    opacity: Math.min(1, progress * 1.6),
    transform: `scale(${progress})`,
  };
};

/**
 * Progression 0 -> 1 d'un trace (soulignement, ligne de temps), en `spring`
 * pour rester coherent avec le reste. Retourne un pourcentage pret a etre
 * pose dans un `scaleX` ou une `width`.
 */
export const useDraw = (delay = 0): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 1.2 },
  });
};
