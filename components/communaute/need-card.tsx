import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CommunityNeed } from "@/lib/api/types";
import {
  IconAlert,
  IconCheck,
  IconEye,
  IconMapPin,
  IconMessage,
  IconThumbsUp,
} from "@/components/ui/icons";

/** Teinte du délai annoncé. Seule l'urgence réelle mérite d'être colorée. */
const urgencyTones: Record<string, string> = {
  urgent: "bg-gold-500/12 text-gold-700 ring-gold-500/25",
  tres_urgent: "bg-danger-50 text-danger-700 ring-danger-200",
};

const urgencyLabels: Record<string, string> = {
  semaine: "Dans la semaine",
  urgent: "Urgent",
  tres_urgent: "Très urgent",
};

/**
 * Carte d'un problème dans l'espace communautaire.
 *
 * Les trois compteurs — vues, réponses, utilité — sont donnés ensemble et en
 * clair : ce sont eux qui disent, avant même d'ouvrir le fil, s'il y a quelque
 * chose à y lire. Une carte qui n'annoncerait que le titre obligerait à ouvrir
 * douze fils pour en trouver un qui a servi à quelqu'un.
 */
export function NeedCard({ need }: { need: CommunityNeed }) {
  const answered = need.replies > 0;

  return (
    // `relative` porte la surface cliquable posée sur le titre plus bas.
    <article className="group relative flex h-full flex-col rounded-3xl bg-white p-5 shadow-card ring-1 ring-marine-950/6 transition-all duration-300 hover:-translate-y-0.5 hover:ring-gold-500/30 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {need.specialty && <Badge tone="neutral">{need.specialty}</Badge>}

        {urgencyLabels[need.urgency] && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase ring-1 ring-inset",
              urgencyTones[need.urgency] ?? "bg-marine-50 text-marine-600 ring-marine-950/8",
            )}
          >
            <IconAlert className="size-3.5" />
            {urgencyLabels[need.urgency]}
          </span>
        )}

        {need.status === "resolu" && (
          <Badge tone="free">
            <IconCheck className="size-3.5" />
            Résolu
          </Badge>
        )}
      </div>

      <h3 className="mt-3.5 font-serif text-lg/snug font-bold text-balance text-marine-950">
        <Link href={`/communaute/${need.slug}`} className="hover:text-gold-700">
          {/* Toute la carte est cliquable via cette surface : elle couvre la
              carte sans englober les liens éventuels du pied. */}
          <span className="absolute inset-0" aria-hidden="true" />
          {need.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm/relaxed text-marine-600">{need.excerpt}</p>

      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-marine-500">
        <span className="font-medium text-marine-700">{need.author}</span>
        <span>{need.date}</span>
        {need.city && (
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="size-3.5" />
            {need.city}
          </span>
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-marine-950/6 pt-3.5 text-xs">
        <Counter
          icon={<IconMessage className="size-3.5" />}
          value={need.replies}
          label={need.replies > 1 ? "réponses" : "réponse"}
          highlight={answered}
        />
        <Counter
          icon={<IconEye className="size-3.5" />}
          value={need.views}
          label={need.views > 1 ? "vues" : "vue"}
        />
        <Counter
          icon={<IconThumbsUp className="size-3.5" />}
          value={need.helpful}
          label="utile"
        />

        {!answered && (
          <span className="ml-auto font-semibold text-gold-700">Sans réponse</span>
        )}
      </div>
    </article>
  );
}

function Counter({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        highlight ? "font-semibold text-trust-600" : "text-marine-500",
      )}
    >
      {icon}
      <span>
        {value} {label}
      </span>
    </span>
  );
}
