import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconBadgeCheck, IconCrown, IconFileText } from "@/components/ui/icons";

type BadgeTone =
  | "free" // article gratuit -> emeraude (preuve/valeur immediate)
  | "premium" // article payant -> or
  | "verified" // avocat verifie -> or
  | "pioneer" // membre pionnier -> marine
  | "neutral";

const tones: Record<BadgeTone, string> = {
  free: "bg-trust-500/10 text-trust-600 ring-trust-500/25",
  premium: "bg-gold-500/10 text-gold-700 ring-gold-500/30",
  verified: "bg-gold-500/10 text-gold-700 ring-gold-500/30",
  pioneer: "bg-marine-950/5 text-marine-800 ring-marine-950/10",
  neutral: "bg-marine-50 text-marine-600 ring-marine-950/8",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Systeme de badges — module 8.3 (Avocat Verifie, Expert Auteur, Pionnier). */
export function LawyerBadge({ kind }: { kind: "verified" | "author" | "pioneer" }) {
  if (kind === "verified") {
    return (
      <Badge tone="verified">
        <IconBadgeCheck className="size-3.5" />
        Vérifié
      </Badge>
    );
  }

  if (kind === "author") {
    return (
      <Badge tone="neutral">
        <IconFileText className="size-3.5" />
        Expert auteur
      </Badge>
    );
  }

  return (
    <Badge tone="pioneer">
      <IconCrown className="size-3.5" />
      Pionnier
    </Badge>
  );
}
