/**
 * Logo TakeALawyer — meme construction que `components/layout/site-header.tsx` :
 * pastille arrondie en degrade or portant la balance, puis le mot-symbole en
 * Playfair avec le « A » central en or.
 */
import type React from "react";
import { COLORS, SHADOW } from "../brand";
import { FONT_SERIF } from "../fonts";
import { IconScale } from "./Icons";

export const Logo: React.FC<{
  /** Hauteur de la pastille. Le reste de la composition en decoule. */
  size?: number;
  /** Sur fond clair, le mot-symbole passe en marine. */
  onLight?: boolean;
}> = ({ size = 64, onLight = false }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${COLORS.gold400}, ${COLORS.gold500})`,
          boxShadow: SHADOW.gold,
        }}
      >
        <IconScale size={size * 0.56} color={COLORS.white} strokeWidth={2} />
      </div>

      <span
        style={{
          fontFamily: FONT_SERIF,
          fontWeight: 700,
          fontSize: size * 0.72,
          letterSpacing: "-0.02em",
          color: onLight ? COLORS.marine950 : COLORS.white,
          lineHeight: 1,
        }}
      >
        Take<span style={{ color: COLORS.gold400 }}>A</span>Lawyer
      </span>
    </div>
  );
};
