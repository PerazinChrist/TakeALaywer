import type { SVGProps } from "react";

/**
 * Jeu d'icones inline.
 * Aucune dependance externe (lucide-react / radix ne sont pas installes) :
 * la page d'accueil reste 100 % autonome et sans requete supplementaire.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Outline({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function Solid({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

/* --- Identite / droit ----------------------------------------------------- */

export const IconScale = (p: IconProps) => (
  <Outline {...p}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </Outline>
);

export const IconGavel = (p: IconProps) => (
  <Outline {...p}>
    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
    <path d="m16 16 6-6" />
    <path d="m8 8 6-6" />
    <path d="m9 7 8 8" />
    <path d="m21 11-8-8" />
  </Outline>
);

/* --- Confiance / securite ------------------------------------------------ */

export const IconShieldCheck = (p: IconProps) => (
  <Outline {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Outline>
);

export const IconBadgeCheck = (p: IconProps) => (
  <Outline {...p}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </Outline>
);

export const IconLock = (p: IconProps) => (
  <Outline {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Outline>
);

export const IconIncognito = (p: IconProps) => (
  <Outline {...p}>
    <path d="M2 8a10.645 10.645 0 0 0 20 0" />
    <path d="m20 15-1.726-2.05" />
    <path d="m4 15 1.726-2.05" />
    <path d="m9 18 .722-3.25" />
    <path d="m15 18-.722-3.25" />
  </Outline>
);

export const IconClock = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Outline>
);

/* --- Navigation / actions ------------------------------------------------ */

export const IconSearch = (p: IconProps) => (
  <Outline {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Outline>
);

export const IconMapPin = (p: IconProps) => (
  <Outline {...p}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </Outline>
);

export const IconArrowRight = (p: IconProps) => (
  <Outline {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Outline>
);

export const IconChevronRight = (p: IconProps) => (
  <Outline {...p}>
    <path d="m9 18 6-6-6-6" />
  </Outline>
);

export const IconChevronDown = (p: IconProps) => (
  <Outline {...p}>
    <path d="m6 9 6 6 6-6" />
  </Outline>
);

export const IconCheck = (p: IconProps) => (
  <Outline {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Outline>
);

export const IconMenu = (p: IconProps) => (
  <Outline {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Outline>
);

export const IconClose = (p: IconProps) => (
  <Outline {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Outline>
);

export const IconSend = (p: IconProps) => (
  <Outline {...p}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.921 3.185a2 2 0 0 1 1.113 1.113z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </Outline>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Outline {...p}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </Outline>
);

/* --- Situations de vie (cards par besoin) ------------------------------- */

export const IconBriefcase = (p: IconProps) => (
  <Outline {...p}>
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Outline>
);

export const IconHome = (p: IconProps) => (
  <Outline {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </Outline>
);

export const IconHeart = (p: IconProps) => (
  <Outline {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Outline>
);

export const IconBuilding = (p: IconProps) => (
  <Outline {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
  </Outline>
);

export const IconFileText = (p: IconProps) => (
  <Outline {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </Outline>
);

export const IconLandPlot = (p: IconProps) => (
  <Outline {...p}>
    <path d="m12 8 6-3-6-3v10" />
    <path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12" />
    <path d="m6.49 12.85 11.02 6.3" />
    <path d="M17.51 12.85 6.5 19.15" />
  </Outline>
);

export const IconUsers = (p: IconProps) => (
  <Outline {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Outline>
);

export const IconMessage = (p: IconProps) => (
  <Outline {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Outline>
);

export const IconPhone = (p: IconProps) => (
  <Outline {...p}>
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  </Outline>
);

export const IconTrendingUp = (p: IconProps) => (
  <Outline {...p}>
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </Outline>
);

export const IconPalette = (p: IconProps) => (
  <Outline {...p}>
    <path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a4 4 0 0 0 4-4 10 10 0 0 0-10-9.6Z" />
    <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  </Outline>
);

/* --- Accents pleins ------------------------------------------------------ */

export const IconStar = (p: IconProps) => (
  <Solid {...p}>
    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345z" />
  </Solid>
);

export const IconSparkles = (p: IconProps) => (
  <Solid {...p}>
    <path d="M11.52 2.37a.5.5 0 0 1 .96 0l1.58 6.13A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0l-1.58-6.13A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5z" />
    <path d="M19 2.5a.4.4 0 0 1 .76 0l.4 1.34a.4.4 0 0 0 .27.27l1.34.4a.4.4 0 0 1 0 .76l-1.34.4a.4.4 0 0 0-.27.27l-.4 1.34a.4.4 0 0 1-.76 0l-.4-1.34a.4.4 0 0 0-.27-.27l-1.34-.4a.4.4 0 0 1 0-.76l1.34-.4a.4.4 0 0 0 .27-.27z" />
  </Solid>
);

export const IconCrown = (p: IconProps) => (
  <Solid {...p}>
    <path d="M11.56 5.27a.5.5 0 0 1 .88 0l2.95 5.6a1 1 0 0 0 1.52.3l4.28-3.67a.5.5 0 0 1 .8.52l-2.84 10.25a1 1 0 0 1-.95.73H5.8a1 1 0 0 1-.96-.73L2.02 8.02a.5.5 0 0 1 .8-.52L7.1 11.17a1 1 0 0 0 1.51-.3z" />
  </Solid>
);

export const IconQuote = (p: IconProps) => (
  <Solid {...p}>
    <path d="M9.5 4A5.5 5.5 0 0 0 4 9.5c0 3 2.2 5.5 5.4 5.5.4 0 .8 0 1.1-.1-.6 2.5-2.6 4.1-5 4.6l.5 1.5c4.4-.8 7.5-4.4 7.5-9.4V9.5A5.5 5.5 0 0 0 9.5 4Z" />
    <path d="M19.5 4A5.5 5.5 0 0 0 14 9.5c0 3 2.2 5.5 5.4 5.5.4 0 .8 0 1.1-.1-.6 2.5-2.6 4.1-5 4.6l.5 1.5c4.4-.8 7.5-4.4 7.5-9.4V9.5A5.5 5.5 0 0 0 19.5 4Z" />
  </Solid>
);

/* --- Reseaux sociaux (footer) ------------------------------------------- */

export const IconFacebook = (p: IconProps) => (
  <Solid {...p}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54v-2.2c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.87h2.78l-.45 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z" />
  </Solid>
);

export const IconLinkedin = (p: IconProps) => (
  <Solid {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.77c0-1.38-.03-3.15-1.95-3.15-1.96 0-2.25 1.5-2.25 3.05V21h-4Z" />
  </Solid>
);

export const IconWhatsapp = (p: IconProps) => (
  <Solid {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </Solid>
);

export const IconX = (p: IconProps) => (
  <Solid {...p}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
  </Solid>
);
