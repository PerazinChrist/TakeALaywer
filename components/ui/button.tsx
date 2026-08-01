import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "gold" // CTA principal — "Poser mon besoin"
  | "ghost" // CTA secondaire sur fond marine
  | "outline" // CTA secondaire sur fond clair
  | "marine" // CTA plein sur fond clair
  | "soft"; // action tertiaire

export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  // Texte marine sur l'or : le blanc sur #d97706 ne plafonne qu'à 3,2:1,
  // sous le seuil AA de 4,5:1. Le marine atteint 5,1:1.
  gold: "bg-gold-500 text-marine-950 shadow-gold hover:bg-gold-400 hover:shadow-[0_22px_50px_-14px_rgb(202_138_4/0.6)] active:translate-y-px",
  ghost:
    "border border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/10",
  outline:
    "border border-marine-200 bg-white text-marine-900 hover:border-marine-400 hover:bg-marine-50",
  marine: "bg-marine-950 text-white hover:bg-marine-800",
  soft: "bg-gold-50 text-gold-700 hover:bg-gold-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 gap-1.5 px-4 text-sm",
  md: "h-12 gap-2 px-6 text-[0.95rem]",
  lg: "h-14 gap-2.5 px-8 text-base",
};

/**
 * Retourne les classes d'un bouton.
 * Volontairement une fonction plutot qu'un composant : les CTA de la landing
 * sont tantot des <Link>, tantot des <button>, tantot des <a>.
 */
export function buttonStyles({
  variant = "gold",
  size = "md",
  full = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}) {
  return cn(
    "group inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}
