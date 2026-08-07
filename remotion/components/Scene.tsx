/**
 * Enveloppe commune a toutes les scenes : fondu d'entree et de sortie.
 *
 * `useCurrentFrame()` est relatif a la `<Sequence>` parente — la frame 0 ici
 * est la premiere image de la scene, pas de la video. C'est ce qui permet
 * d'ecrire chaque scene comme si elle etait seule au monde, et de la deplacer
 * sur la timeline sans retoucher une seule interpolation.
 */
import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FADE, GUTTER } from "../brand";

export const Scene: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
  /** Alignement vertical du contenu. Par defaut : centre. */
  justify?: React.CSSProperties["justifyContent"];
}> = ({ durationInFrames, children, justify = "center" }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: justify,
        alignItems: "flex-start",
        padding: `0 ${GUTTER}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
