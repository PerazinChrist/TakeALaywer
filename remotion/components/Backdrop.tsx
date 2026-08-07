/**
 * Fond continu de la video.
 *
 * Il est rendu **hors** des `<Sequence>`, une seule fois pour les 600 images.
 * Si chaque scene portait son propre fond, les fondus croises feraient
 * apparaitre un instant le noir du canvas entre deux plans — le defaut se voit
 * surtout sur les ecrans OLED des telephones, cible principale de cette pub.
 *
 * Les halos derivent lentement sur toute la duree : c'est la transposition du
 * `--animate-float` de globals.css, cale ici sur la timeline plutot que sur
 * une animation CSS (une keyframe CSS n'est pas deterministe au rendu — deux
 * rendus successifs ne tomberaient pas sur la meme image).
 */
import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, VIDEO } from "../brand";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = frame / VIDEO.durationInFrames;

  /** Derive douce, en sinusoide, pour eviter tout raccord visible. */
  const drift = (amplitude: number, phase: number) =>
    Math.sin(progress * Math.PI * 2 + phase) * amplitude;

  /** Lent zoom d'ensemble : donne de la vie sans jamais attirer l'oeil. */
  const scale = interpolate(progress, [0, 1], [1, 1.08]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.marine950 }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {/* Halo or, en haut a droite — rappelle le degrade des CTA du site. */}
        <div
          style={{
            position: "absolute",
            top: -260 + drift(40, 0),
            right: -300 + drift(60, 1.2),
            width: 1100,
            height: 1100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.gold500}55 0%, ${COLORS.gold500}00 62%)`,
          }}
        />

        {/* Halo marine clair, en bas a gauche — profondeur et contraste. */}
        <div
          style={{
            position: "absolute",
            bottom: -420 + drift(50, 2.4),
            left: -320 + drift(45, 3.6),
            width: 1300,
            height: 1300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.marine500}4d 0%, ${COLORS.marine500}00 65%)`,
          }}
        />

        {/* Touche emeraude, tres discrete : la couleur de la preuve sociale. */}
        <div
          style={{
            position: "absolute",
            top: 780 + drift(70, 1.8),
            left: -180,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.trust500}26 0%, ${COLORS.trust500}00 70%)`,
          }}
        />
      </AbsoluteFill>

      {/* Vignette : ramene l'attention au centre et assoit le texte blanc. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.marine950}b3 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
