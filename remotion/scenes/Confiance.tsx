/**
 * Scene 4 — la preuve.
 *
 * Reprise de la carte flottante du hero (`HeroVisual`) : avatar, badge de
 * verification, note, message, delai de reponse. Meme composition, meme
 * hierarchie — quelqu'un qui voit la pub puis arrive sur le site doit
 * reconnaitre l'ecran.
 *
 * Le message affiche reste illustratif : c'est une maquette de conversation,
 * pas un echange qui a eu lieu — et il ne pourrait pas l'etre, puisque les
 * echanges entre un citoyen et son avocat sont couverts par le secret
 * professionnel. La meme reserve figure dans `components/home/hero-section.tsx`
 * et doit etre tenue ici avec encore plus de rigueur : une publicite qui
 * laisserait croire a une consultation reelle serait attaquable.
 */
import type React from "react";
import { COLORS, SHADOW, TYPE } from "../brand";
import { FONT_SANS, FONT_SERIF } from "../fonts";
import { usePop, useReveal } from "../anim";
import { IconBadgeCheck, IconClock, IconIncognito, IconStar } from "../components/Icons";
import type { AdProps } from "../props";

export const Confiance: React.FC<AdProps> = ({
  averageRating,
  reviewsCount,
  lawyerName,
  lawyerInitials,
  lawyerSpecialty,
  lawyerCity,
  lawyerResponseTime,
}) => {
  const eyebrow = useReveal(0, 20);
  const card = useReveal(8, 52);
  const anonymous = usePop(30);
  const proof = usePop(38);

  return (
    <div style={{ width: "100%" }}>
      <span
        style={{
          ...eyebrow,
          display: "block",
          /* Large : la pastille « Vous restez anonyme » deborde du haut de la
             carte et viendrait sinon toucher cette ligne. */
          marginBottom: 92,
          fontFamily: FONT_SANS,
          fontSize: TYPE.label,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.gold400,
        }}
      >
        Des avocats vérifiés
      </span>

      <div style={{ position: "relative" }}>
        <div
          style={{
            ...card,
            padding: 44,
            borderRadius: 44,
            backgroundColor: COLORS.white,
            boxShadow: SHADOW.marine,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {/* Avatar en initiales : aucun visage reel n'est engage. */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 108,
                  height: 108,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${COLORS.marine600}, ${COLORS.marine950})`,
                  fontFamily: FONT_SANS,
                  fontSize: 38,
                  fontWeight: 600,
                  color: COLORS.white,
                }}
              >
                {lawyerInitials}
                {/* Pastille « en ligne » — le vert de la preuve sociale. */}
                <span
                  style={{
                    position: "absolute",
                    right: 2,
                    bottom: 6,
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: COLORS.trust500,
                    border: `4px solid ${COLORS.white}`,
                  }}
                />
              </div>

              <div>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    margin: 0,
                    fontFamily: FONT_SERIF,
                    fontSize: TYPE.cardTitle,
                    fontWeight: 700,
                    color: COLORS.marine950,
                  }}
                >
                  {lawyerName}
                  <IconBadgeCheck size={34} color={COLORS.gold400} />
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontFamily: FONT_SANS,
                    fontSize: TYPE.hint,
                    color: COLORS.marine500,
                  }}
                >
                  {lawyerSpecialty} · {lawyerCity}
                </p>
                <Stars value={averageRating} reviews={reviewsCount} />
              </div>
            </div>

            <span
              style={{
                flexShrink: 0,
                padding: "10px 22px",
                borderRadius: 999,
                backgroundColor: `${COLORS.trust500}1a`,
                border: `1px solid ${COLORS.trust500}40`,
                fontFamily: FONT_SANS,
                fontSize: TYPE.label - 4,
                fontWeight: 600,
                color: COLORS.trust600,
              }}
            >
              Disponible
            </span>
          </div>

          <p
            style={{
              margin: "38px 0 0",
              padding: 34,
              borderRadius: 28,
              backgroundColor: COLORS.marine50,
              fontFamily: FONT_SANS,
              fontSize: TYPE.body - 2,
              lineHeight: 1.5,
              color: COLORS.marine800,
            }}
          >
            «&nbsp;Votre situation relève d’une requalification. Avant toute
            démarche, réunissez vos trois derniers bulletins de paie — je vous
            explique la suite.&nbsp;»
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              marginTop: 34,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: FONT_SANS,
                fontSize: TYPE.hint,
                fontWeight: 500,
                color: COLORS.marine600,
              }}
            >
              <IconClock size={30} color={COLORS.gold400} />
              {lawyerResponseTime}
            </span>

            <span
              style={{
                padding: "16px 30px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${COLORS.marine800}, ${COLORS.marine950})`,
                fontFamily: FONT_SANS,
                fontSize: TYPE.hint,
                fontWeight: 600,
                color: COLORS.white,
              }}
            >
              Accepter le contact
            </span>
          </div>
        </div>

        {/* Pastille anonymat, calee comme sur le hero (hors du coin superieur). */}
        <div
          style={{
            ...anonymous,
            position: "absolute",
            top: -34,
            left: -22,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 26px",
            borderRadius: 24,
            backgroundColor: COLORS.marine950,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: SHADOW.marine,
          }}
        >
          <IconIncognito size={32} color={COLORS.gold400} />
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.label,
              fontWeight: 600,
              color: COLORS.white,
            }}
          >
            Vous restez anonyme
          </span>
        </div>

      </div>

      {/*
        Compteur d'avis — la seule allegation chiffree de la scene.
        Pose sous la carte, dans le flux, et non en pastille flottante : en
        absolu il recouvrait le bouton « Accepter le contact ». Une pastille
        decorative qui masque l'action principale de la maquette, c'est la pub
        qui contredit le produit qu'elle montre.
      */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
        <div
          style={{
            ...proof,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 30px",
            borderRadius: 24,
            backgroundColor: COLORS.gold500,
            boxShadow: SHADOW.gold,
          }}
        >
          <IconStar size={34} color={COLORS.marine950} />
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.label,
              fontWeight: 700,
              lineHeight: 1.25,
              color: COLORS.marine950,
            }}
          >
            {averageRating.toLocaleString("fr-FR")}/5
            <span style={{ display: "block", fontWeight: 500 }}>
              sur {reviewsCount.toLocaleString("fr-FR")} avis certifiés
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

/** Note en etoiles — equivalent video de `components/ui/rating.tsx`. */
const Stars: React.FC<{ value: number; reviews: number }> = ({ value, reviews }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <IconStar
          key={index}
          size={26}
          color={index < Math.round(value) ? COLORS.gold400 : COLORS.marine200}
        />
      ))}
    </div>
    <span
      style={{
        fontFamily: FONT_SANS,
        fontSize: TYPE.label - 3,
        color: COLORS.marine500,
      }}
    >
      {value.toLocaleString("fr-FR")} · {reviews.toLocaleString("fr-FR")} avis
    </span>
  </div>
);
