/**
 * Scene 5 — l'appel a l'action.
 *
 * Seule scene centree de la video : apres quatre plans cales a gauche, le
 * recentrage agit comme une ponctuation et fixe le regard sur le bouton.
 *
 * La formule reprise sous le bouton est celle de `HowItWorks` — « Gratuit,
 * anonyme et sans engagement — aucune carte bancaire demandée ». C'est la
 * promesse la plus desarmante du site face a la peur d'appeler un avocat ;
 * c'est aussi un engagement verifiable, donc tenable en publicite.
 */
import type React from "react";
import { COLORS, SHADOW, TYPE } from "../brand";
import { FONT_SANS, FONT_SERIF } from "../fonts";
import { usePop, useReveal } from "../anim";
import { Logo } from "../components/Logo";
import { IconArrowRight } from "../components/Icons";

export const Cta: React.FC = () => {
  const logo = useReveal(0, 30);
  const title = useReveal(10);
  const button = usePop(24);
  const url = useReveal(38, 18);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        textAlign: "center",
      }}
    >
      <div style={logo}>
        <Logo size={92} />
      </div>

      <h2
        style={{
          ...title,
          margin: "70px 0 0",
          fontFamily: FONT_SERIF,
          fontSize: TYPE.title + 6,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          color: COLORS.white,
        }}
      >
        Posez votre besoin.
        <br />
        <span style={{ color: COLORS.gold400 }}>Gratuitement.</span>
      </h2>

      <div
        style={{
          ...button,
          display: "flex",
          alignItems: "center",
          gap: 20,
          margin: "68px 0 0",
          padding: "34px 62px",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS.gold400}, ${COLORS.gold500})`,
          boxShadow: SHADOW.gold,
        }}
      >
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.cardTitle,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: COLORS.white,
          }}
        >
          Poser mon besoin
        </span>
        <IconArrowRight size={40} color={COLORS.white} strokeWidth={2.2} />
      </div>

      <p
        style={{
          ...url,
          margin: "44px 0 0",
          fontFamily: FONT_SANS,
          fontSize: TYPE.hint,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Anonyme et sans engagement — aucune carte bancaire demandée.
      </p>

      <p
        style={{
          ...url,
          margin: "34px 0 0",
          fontFamily: FONT_SANS,
          fontSize: TYPE.body,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: COLORS.white,
        }}
      >
        takealawyer.com
      </p>
    </div>
  );
};
