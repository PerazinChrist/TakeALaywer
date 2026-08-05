import { groupDigits } from "@/lib/utils";
import type { PlatformStats } from "@/lib/api/public";
import {
  IconBadgeCheck,
  IconClock,
  IconIncognito,
  IconUsers,
} from "@/components/ui/icons";

const icons = {
  users: IconUsers,
  incognito: IconIncognito,
  clock: IconClock,
  badge: IconBadgeCheck,
} as const;

const tones = {
  gold: "bg-gold-50 text-gold-600 ring-gold-500/15",
  trust: "bg-trust-500/8 text-trust-600 ring-trust-500/15",
  marine: "bg-marine-50 text-marine-600 ring-marine-950/8",
} as const;

/**
 * Barre de réassurance — chiffres clés.
 *
 * Les quatre valeurs viennent de la base, pas d'un tableau écrit à la main. Un
 * annuaire qui annonce « 7 000+ avocats » et en présente cent quatre-vingts
 * décrédibilise tout ce qui l'entoure ; il vaut mieux un chiffre modeste et
 * exact. Seul l'anonymat reste une promesse et non une mesure, parce que c'en
 * est une : la plateforme n'expose jamais l'identité du citoyen.
 */
export function TrustBanner({ stats }: { stats: PlatformStats }) {
  const entries = [
    {
      value: groupDigits(stats.directory),
      label: stats.directory > 1 ? "Avocats & cabinets vérifiés" : "Avocat vérifié",
      icon: "users" as const,
      tone: "gold" as const,
    },
    {
      value: "100 %",
      label: "Anonymat garanti",
      icon: "incognito" as const,
      tone: "trust" as const,
    },
    {
      value: groupDigits(stats.guides),
      label: "Guides publiés par des avocats",
      icon: "clock" as const,
      tone: "gold" as const,
    },
    {
      value: groupDigits(stats.reviews),
      label: "Avis certifiés après échange",
      icon: "badge" as const,
      tone: "trust" as const,
    },
  ];

  return (
    <section className="bg-white py-10" aria-label="Chiffres clés">
      <div className="container-page">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {entries.map((stat) => {
            const Icon = icons[stat.icon];

            return (
              <div key={stat.label} className="flex items-center gap-3.5">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${tones[stat.tone]}`}
                >
                  <Icon className="size-5.5" />
                </span>
                <div className="flex flex-col">
                  <dt className="order-2 text-sm/tight text-marine-600">{stat.label}</dt>
                  <dd className="order-1 font-serif text-2xl font-bold text-marine-950">
                    {stat.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
