/**
 * Charte graphique de la video, transposee depuis `app/globals.css`.
 *
 * Pourquoi dupliquer les couleurs plutot que d'importer Tailwind ici : le
 * bundler de Remotion ne partage pas le pipeline PostCSS de Next, et surtout
 * une video se compose en pixels absolus (1080 x 1920), pas en `rem`. Les
 * classes utilitaires du site — calees sur une racine de 16 px et des
 * breakpoints navigateur — n'ont aucun sens sur une timeline. On garde donc
 * des styles inline et une seule source de verite : ce fichier.
 *
 * Regle de maintenance : si une valeur bouge dans `@theme` de globals.css,
 * elle doit bouger ici aussi. Les noms sont volontairement identiques
 * (marine-950, gold-500, trust-500) pour que la correspondance soit evidente.
 */

/* -------------------------------------------------------------------------- */
/* Couleurs                                                                    */
/* -------------------------------------------------------------------------- */

export const COLORS = {
  /** Bleu nuit : autorite, securite, prestige. Fond dominant de la video. */
  marine50: "#f4f7fb",
  marine100: "#e6eef7",
  marine200: "#c8dae9",
  marine300: "#97b7d3",
  marine400: "#5f8fb8",
  marine500: "#3c6f9d",
  marine600: "#2c5583",
  marine800: "#1c3352",
  marine900: "#15243c",
  marine950: "#0f172a",

  /** Or mat : justice, excellence — reserve aux accents et aux CTA. */
  gold300: "#fcd34d",
  gold400: "#f59e0b",
  gold500: "#d97706",
  gold600: "#ca8a04",

  /** Vert emeraude : strictement reserve a la preuve sociale, comme sur le site. */
  trust400: "#34d399",
  trust500: "#10b981",
  trust600: "#059669",

  white: "#ffffff",
  /** Fond du bandeau de navigation du site — sert de surface claire ici. */
  panel: "#e8e8ea",
} as const;

/* -------------------------------------------------------------------------- */
/* Format                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Vertical 9:16. Choix assume : `directive-ui.md` § 5 rappelle que plus de
 * 70 % de l'audience navigue au telephone. Une pub qui doit vivre en story
 * Instagram, en statut WhatsApp ou en Reel se tourne dans ce format, pas en
 * 16:9 recadre apres coup.
 */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** 20 secondes : au-dela, une pub sociale perd la moitie de son audience. */
  durationInFrames: 600,
} as const;

/** Marge laterale unique — l'equivalent video du `container-page` du site. */
export const GUTTER = 88;

/* -------------------------------------------------------------------------- */
/* Typographie                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Les familles sont resolues dans `fonts.ts` (chargement asynchrone). Ici on
 * ne garde que l'echelle typographique, exprimee en pixels reels du canvas.
 */
export const TYPE = {
  hero: 104,
  title: 76,
  cardTitle: 40,
  body: 34,
  hint: 29,
  label: 26,
} as const;

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

/** Duree du fondu d'entree et de sortie de chaque scene, en images. */
export const FADE = 12;

/**
 * Decoupage narratif. Les scenes s'enchainent en fondu croise : chacune
 * demarre `FADE` images avant la fin de la precedente, ce qui evite le noir
 * d'une image entre deux plans.
 */
const DURATIONS = [
  { id: "hook", duration: 112 }, // le probleme
  { id: "situations", duration: 148 }, // il vous ressemble
  { id: "etapes", duration: 190 }, // la solution, en 3 temps
  { id: "confiance", duration: 100 }, // la preuve
  { id: "cta", duration: 98 }, // l'appel a l'action
] as const;

export type SceneId = (typeof DURATIONS)[number]["id"];

/**
 * Positions absolues calculees a partir des durees, avec le chevauchement.
 * Calculer plutot que d'ecrire les `from` a la main evite le bug classique :
 * on rallonge une scene, on oublie de decaler les suivantes, et la fin de la
 * video est tronquee sans que rien ne le signale.
 */
export const TIMELINE = DURATIONS.reduce<
  { id: SceneId; from: number; duration: number }[]
>((acc, scene) => {
  const previous = acc[acc.length - 1];
  const from = previous ? previous.from + previous.duration - FADE : 0;
  acc.push({ id: scene.id, from, duration: scene.duration });
  return acc;
}, []);

/** Premiere image de la scene finale — sert a retirer le filigrane a temps. */
export const CTA_FROM = TIMELINE[TIMELINE.length - 1].from;

/* -------------------------------------------------------------------------- */
/* Ombres                                                                      */
/* -------------------------------------------------------------------------- */

export const SHADOW = {
  marine: "0 40px 90px -30px rgba(15, 23, 42, 0.65)",
  gold: "0 28px 60px -18px rgba(217, 119, 6, 0.55)",
  card: "0 2px 4px rgba(15, 23, 42, 0.06), 0 30px 70px -24px rgba(15, 23, 42, 0.45)",
} as const;
