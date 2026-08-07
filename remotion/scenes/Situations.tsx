/**
 * Scene 2 — la reconnaissance.
 *
 * Le spectateur doit se reconnaitre dans une carte en moins d'une seconde.
 * Les trois situations et leurs sous-titres sont repris mot pour mot de
 * `needCards` (lib/data/home.ts), volontairement recopies ici plutot
 * qu'importes : le bundler de Remotion ne partage pas l'alias `@/` de Next, et
 * une accroche video se taille plus court qu'une carte cliquable. Si la
 * formulation change sur le site, elle doit etre reportee ici — c'est le prix
 * de l'independance des deux bundles.
 *
 * L'ordre n'est pas celui du site : on ouvre sur le litige locatif et le
 * licenciement, les deux situations les plus anxiogenes, avant la creation
 * d'entreprise qui est un projet et non un probleme.
 */
import type React from "react";
import { COLORS, SHADOW, TYPE } from "../brand";
import { FONT_SANS, FONT_SERIF } from "../fonts";
import { useReveal } from "../anim";
import { IconBriefcase, IconFileText, IconHome } from "../components/Icons";

type Situation = {
  title: string;
  hint: string;
  Icon: React.FC<{ size: number; color: string }>;
};

const SITUATIONS: Situation[] = [
  {
    title: "Litige avec mon propriétaire",
    hint: "Bail, expulsion, caution, loyers impayés",
    Icon: IconHome,
  },
  {
    title: "Licenciement ou contrat de travail",
    hint: "Solde de tout compte, abus, requalification",
    Icon: IconFileText,
  },
  {
    title: "Je souhaite créer une entreprise",
    hint: "Statuts, SARL, agréments, fiscalité",
    Icon: IconBriefcase,
  },
];

export const Situations: React.FC = () => {
  const eyebrow = useReveal(0, 20);
  const title = useReveal(6);

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
        Votre situation
      </span>

      <h2
        style={{
          ...title,
          margin: "26px 0 60px",
          fontFamily: FONT_SERIF,
          fontSize: TYPE.title,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: COLORS.white,
        }}
      >
        Elle porte déjà un nom.
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {SITUATIONS.map((situation, index) => (
          <SituationCard
            key={situation.title}
            situation={situation}
            /* Cascade de 9 images : la liste se remplit, elle ne surgit pas. */
            delay={18 + index * 9}
          />
        ))}
      </div>
    </div>
  );
};

const SituationCard: React.FC<{ situation: Situation; delay: number }> = ({
  situation: { title, hint, Icon },
  delay,
}) => {
  const reveal = useReveal(delay, 34);

  return (
    <div
      style={{
        ...reveal,
        display: "flex",
        alignItems: "center",
        gap: 32,
        padding: "36px 40px",
        borderRadius: 34,
        backgroundColor: COLORS.white,
        boxShadow: SHADOW.card,
      }}
    >
      {/* Pastille marine + icone or : le duo de la section « comment ça marche ». */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 96,
          height: 96,
          borderRadius: 26,
          background: `linear-gradient(135deg, ${COLORS.marine800}, ${COLORS.marine950})`,
        }}
      >
        <Icon size={46} color={COLORS.gold300} />
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_SANS,
            fontSize: TYPE.cardTitle,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: COLORS.marine950,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "12px 0 0",
            fontFamily: FONT_SANS,
            fontSize: TYPE.hint,
            lineHeight: 1.35,
            color: COLORS.marine600,
          }}
        >
          {hint}
        </p>
      </div>
    </div>
  );
};
