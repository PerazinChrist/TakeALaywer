/**
 * Montage de la publicite TakeALawyer — 20 s, 9:16.
 *
 * Structure narrative : probleme -> reconnaissance -> mecanique -> preuve ->
 * action. C'est la meme progression que la page d'accueil (hero anxiogene,
 * cartes par besoin, « comment ca marche », avis certifies, CTA), compressee
 * au rythme d'un fil social.
 *
 * Le fond et le filigrane vivent hors des `<Sequence>`, les scenes dedans :
 * ce decoupage garantit qu'aucun fondu croise ne laisse passer le noir du
 * canvas, et permet de reordonner les scenes en ne touchant qu'a `TIMELINE`.
 */
import type React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CTA_FROM, GUTTER, TIMELINE, type SceneId } from "./brand";
import { Backdrop } from "./components/Backdrop";
import { Logo } from "./components/Logo";
import { Scene } from "./components/Scene";
import { Hook } from "./scenes/Hook";
import { Situations } from "./scenes/Situations";
import { Etapes } from "./scenes/Etapes";
import { Confiance } from "./scenes/Confiance";
import { Cta } from "./scenes/Cta";
import type { AdProps } from "./props";

/** Acces nomme a la timeline — evite les index magiques dans le JSX. */
const at = (id: SceneId) => {
  const scene = TIMELINE.find((entry) => entry.id === id);
  if (!scene) throw new Error(`Scene inconnue dans TIMELINE : ${id}`);
  return scene;
};

export const PubTakeALawyer: React.FC<AdProps> = (props) => {
  const hook = at("hook");
  const situations = at("situations");
  const etapes = at("etapes");
  const confiance = at("confiance");
  const cta = at("cta");

  return (
    <AbsoluteFill>
      <Backdrop />

      {/*
        Filigrane : la marque reste presente pendant tout le corps de la pub,
        puis s'efface juste avant la scene finale — ou le logo revient en
        grand. Deux logos a l'ecran en meme temps affaibliraient les deux.
      */}
      <Sequence durationInFrames={CTA_FROM} name="Filigrane">
        <AbsoluteFill style={{ padding: `${GUTTER * 0.7}px ${GUTTER}px`, opacity: 0.85 }}>
          <Logo size={44} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={hook.from} durationInFrames={hook.duration} name="1 · Accroche">
        <Scene durationInFrames={hook.duration}>
          <Hook />
        </Scene>
      </Sequence>

      <Sequence
        from={situations.from}
        durationInFrames={situations.duration}
        name="2 · Situations"
      >
        <Scene durationInFrames={situations.duration}>
          <Situations />
        </Scene>
      </Sequence>

      <Sequence from={etapes.from} durationInFrames={etapes.duration} name="3 · Étapes">
        <Scene durationInFrames={etapes.duration}>
          <Etapes />
        </Scene>
      </Sequence>

      <Sequence
        from={confiance.from}
        durationInFrames={confiance.duration}
        name="4 · Confiance"
      >
        <Scene durationInFrames={confiance.duration}>
          <Confiance {...props} />
        </Scene>
      </Sequence>

      <Sequence from={cta.from} durationInFrames={cta.duration} name="5 · Appel à l'action">
        <Scene durationInFrames={cta.duration}>
          <Cta />
        </Scene>
      </Sequence>
    </AbsoluteFill>
  );
};
