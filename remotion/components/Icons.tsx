/**
 * Icones de la video, reprises trait pour trait de `components/ui/icons.tsx`.
 *
 * Elles sont recopiees plutot qu'importees : les composants du site attendent
 * des classes Tailwind (`size-6`, `text-gold-500`) que le bundler de Remotion
 * ne compile pas. On garde donc les memes chemins SVG, mais pilotes par des
 * props numeriques — une video ne connait que des pixels.
 *
 * Meme parti pris que le site par ailleurs : aucune dependance d'icones
 * (lucide-react et consorts ne sont pas installes sur ce projet).
 */
import type React from "react";

type IconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

const Outline: React.FC<IconProps & { children: React.ReactNode }> = ({
  size,
  color,
  strokeWidth = 1.75,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

/* --- Identite / droit ----------------------------------------------------- */

export const IconScale: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </Outline>
);

/* --- Confiance / securite ------------------------------------------------- */

export const IconShieldCheck: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Outline>
);

export const IconBadgeCheck: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </Outline>
);

export const IconIncognito: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M2 8a10.645 10.645 0 0 0 20 0" />
    <path d="m20 15-1.726-2.05" />
    <path d="m4 15 1.726-2.05" />
    <path d="m9 18 .722-3.25" />
    <path d="m15 18-.722-3.25" />
  </Outline>
);

export const IconClock: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Outline>
);

/* --- Actions -------------------------------------------------------------- */

export const IconSend: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.921 3.185a2 2 0 0 1 1.113 1.113z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </Outline>
);

export const IconMessage: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Outline>
);

export const IconArrowRight: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Outline>
);

/* --- Situations de vie ---------------------------------------------------- */

export const IconHome: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </Outline>
);

export const IconBriefcase: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Outline>
);

export const IconFileText: React.FC<IconProps> = (p) => (
  <Outline {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </Outline>
);

/** Etoile pleine — note moyenne de la scene « confiance ». */
export const IconStar: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="m12 2.5 2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.32l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95z" />
  </svg>
);
