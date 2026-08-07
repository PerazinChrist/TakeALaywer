/**
 * Catalogue des compositions rendues par Remotion.
 *
 * Un `id` de composition est une cle publique : c'est lui qu'on passe a
 * `npx remotion render`. Le renommer casse les scripts npm et les eventuelles
 * chaines CI — a traiter comme une route, pas comme un nom de variable.
 */
import type React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./brand";
import { PubTakeALawyer } from "./PubTakeALawyer";
import { DEFAULT_AD_PROPS } from "./props";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Format principal : story / statut WhatsApp / Reel — 9:16. */}
      <Composition
        id="PubTakeALawyer"
        component={PubTakeALawyer}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={DEFAULT_AD_PROPS}
      />

      {/*
        Pas de declinaison 1:1 ni 16:9 pour l'instant, et c'est un choix
        verifie plutot qu'un oubli : la meme composition rendue en 1080x1080 a
        ete essayee, la scene « Étapes » y deborde des deux cotes (l'exergue
        passe sous le filigrane, la troisieme etape sort du cadre).

        La cause n'est pas une largeur mais une hauteur : les scenes sont
        dimensionnees pour 1920 px de haut, un carre n'en offre que 1080. Un
        second format demande donc une echelle typographique et un decoupage
        propres — au minimum sortir la scene « Étapes » en deux plans de deux
        puis une etape. C'est un travail de mise en page, pas un parametre.
      */}
    </>
  );
};
