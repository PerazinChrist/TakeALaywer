/**
 * Scene 1 — l'accroche.
 *
 * Trois secondes pour nommer le probleme du spectateur, pas le produit.
 * `directive-ui.md` § 3 le dit sans detour : « le droit fait peur ». La pub
 * part donc de cette peur, et ne prononce le nom de la plateforme qu'a la fin.
 */
import type React from "react";
import { COLORS, GUTTER, TYPE } from "../brand";
import { FONT_SANS, FONT_SERIF } from "../fonts";
import { useDraw, useReveal } from "../anim";

export const Hook: React.FC = () => {
  const eyebrow = useReveal(0, 24);
  const line1 = useReveal(6);
  const line2 = useReveal(14);
  const subtitle = useReveal(26, 30);
  const underline = useDraw(30);

  return (
    <div style={{ width: "100%" }}>
      {/* Pastille de localisation — reprend le pill vert du hero du site. */}
      <div
        style={{
          ...eyebrow,
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 30px 14px 22px",
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: COLORS.trust400,
            boxShadow: `0 0 0 8px ${COLORS.trust500}33`,
          }}
        />
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.label,
            fontWeight: 500,
            color: COLORS.marine200,
            letterSpacing: "0.01em",
          }}
        >
          Douala · Yaoundé · partout au Cameroun
        </span>
      </div>

      <h1
        style={{
          margin: "56px 0 0",
          fontFamily: FONT_SERIF,
          fontSize: TYPE.hero,
          lineHeight: 1.06,
          letterSpacing: "-0.025em",
          color: COLORS.white,
        }}
      >
        <span style={{ ...line1, display: "block", fontWeight: 400, color: COLORS.marine300 }}>
          Un problème
        </span>

        <span style={{ ...line2, display: "block", fontWeight: 800, position: "relative" }}>
          juridique&nbsp;?
          {/*
            Soulignement or, trace de gauche a droite : meme geste que le
            <svg> pose sous « en un clic » dans le hero de la page d'accueil.
            `pathLength=1` normalise la longueur du trace, ce qui permet de
            piloter le dash avec une progression 0 -> 1 sans mesurer le chemin.
          */}
          <svg
            width={430}
            height={26}
            viewBox="0 0 200 12"
            fill="none"
            preserveAspectRatio="none"
            /* Sous la ligne de base des jambages : a -14 le trait coupait le
               « j » et le « q » de « juridique ». */
            style={{ position: "absolute", left: 4, bottom: -30 }}
          >
            <path
              d="M2 8c40-5 92-7 196-4"
              stroke={COLORS.gold400}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - underline}
            />
          </svg>
        </span>
      </h1>

      <p
        style={{
          ...subtitle,
          margin: `${GUTTER / 2 + 20}px 0 0`,
          maxWidth: 780,
          fontFamily: FONT_SANS,
          fontSize: TYPE.body + 6,
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.72)",
        }}
      >
        Et aucune idée de par où commencer.
      </p>
    </div>
  );
};
