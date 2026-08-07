/**
 * Scene 3 — la mecanique, en trois temps.
 *
 * C'est le coeur de la pub et la scene la plus longue (6 s environ) : c'est
 * ici que se leve l'objection principale, « je ne sais pas comment ca se
 * passe ». Le fil or qui descend d'une etape a l'autre reprend le
 * `bg-linear-to-r from-gold-300/0 via-gold-400` du composant `HowItWorks`,
 * bascule a la verticale pour le format 9:16.
 *
 * Les textes condensent `howItWorksSteps` : la promesse et la garantie sont
 * conservees mot pour mot (« Gratuit & anonyme », « Réponses sous 24h »,
 * « Paiement sécurisé ») parce que ce sont des engagements commerciaux — les
 * reformuler dans une pub, c'est prendre le risque de promettre autre chose
 * que ce que la plateforme tient.
 */
import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, TYPE } from "../brand";
import { FONT_SANS, FONT_SERIF } from "../fonts";
import { useReveal } from "../anim";
import {
  IconMessage,
  IconSend,
  IconShieldCheck,
} from "../components/Icons";

type Step = {
  step: string;
  title: string;
  description: string;
  highlight: string;
  Icon: React.FC<{ size: number; color: string }>;
};

const STEPS: Step[] = [
  {
    step: "1",
    title: "Posez votre besoin",
    description: "Un formulaire guidé, sans jargon, en 3 minutes.",
    highlight: "Gratuit & anonyme",
    Icon: IconSend,
  },
  {
    step: "2",
    title: "Recevez des offres d’avocats",
    description: "Acheminé vers les avocats de la spécialité concernée.",
    highlight: "Réponses sous 24h",
    Icon: IconMessage,
  },
  {
    step: "3",
    title: "Vous choisissez qui vous rappelle",
    description: "Messagerie chiffrée, rendez-vous, ou guide d’avocat.",
    highlight: "Paiement sécurisé",
    Icon: IconShieldCheck,
  },
];

/** Geometrie de la colonne de gauche — le fil doit tomber pile au centre. */
const BADGE = 116;
const ROW_GAP = 54;

export const Etapes: React.FC = () => {
  const frame = useCurrentFrame();
  const eyebrow = useReveal(0, 20);
  const title = useReveal(6);

  /*
    Le fil se trace en meme temps que les etapes apparaissent (images 26 a 138)
    plutot qu'en un `spring` unique : il doit rejoindre chaque pastille au
    moment ou elle se pose, sinon la ligne arrive avant le contenu et le lien
    de cause a effet se perd.
  */
  const thread = interpolate(frame, [26, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <div style={{ width: "100%" }}>
      <span
        style={{
          ...eyebrow,
          display: "block",
          fontFamily: FONT_SANS,
          fontSize: TYPE.label,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.gold400,
        }}
      >
        Comment ça marche
      </span>

      <h2
        style={{
          ...title,
          margin: "26px 0 72px",
          fontFamily: FONT_SERIF,
          fontSize: TYPE.title,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: COLORS.white,
        }}
      >
        Trois étapes,
        <br />
        aucune mauvaise surprise.
      </h2>

      <div style={{ position: "relative" }}>
        {/* Fil conducteur, derriere les pastilles. */}
        <div
          style={{
            position: "absolute",
            left: BADGE / 2 - 2,
            top: BADGE / 2,
            width: 4,
            height: `calc(100% - ${BADGE}px)`,
            transform: `scaleY(${thread})`,
            transformOrigin: "top",
            background: `linear-gradient(to bottom, ${COLORS.gold400}, ${COLORS.gold500}66)`,
            borderRadius: 999,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP }}>
          {STEPS.map((step, index) => (
            <StepRow key={step.step} step={step} delay={26 + index * 26} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StepRow: React.FC<{ step: Step; delay: number }> = ({
  step: { step, title, description, highlight, Icon },
  delay,
}) => {
  const reveal = useReveal(delay, 30);

  return (
    <div style={{ ...reveal, display: "flex", alignItems: "flex-start", gap: 40 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: BADGE,
            height: BADGE,
            borderRadius: 30,
            background: `linear-gradient(135deg, ${COLORS.marine800}, ${COLORS.marine950})`,
            border: `1px solid rgba(255,255,255,0.10)`,
          }}
        >
          <Icon size={52} color={COLORS.gold300} />
        </div>

        {/* Numero de l'etape — pastille or, comme sur la section du site. */}
        <div
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 999,
            backgroundColor: COLORS.gold500,
            border: `5px solid ${COLORS.marine950}`,
            fontFamily: FONT_SERIF,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          {step}
        </div>
      </div>

      <div style={{ paddingTop: 4 }}>
        <span
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 999,
            backgroundColor: `${COLORS.trust500}1f`,
            fontFamily: FONT_SANS,
            fontSize: TYPE.label - 3,
            fontWeight: 600,
            color: COLORS.trust400,
          }}
        >
          {highlight}
        </span>

        <p
          style={{
            margin: "18px 0 0",
            fontFamily: FONT_SERIF,
            fontSize: TYPE.cardTitle + 4,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: COLORS.white,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 620,
            fontFamily: FONT_SANS,
            fontSize: TYPE.hint,
            lineHeight: 1.4,
            color: COLORS.marine300,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
