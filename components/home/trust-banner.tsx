import { trustStats } from "@/lib/data/home";
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

/** Barre de réassurance — chiffres clés en temps réel. */
export function TrustBanner() {
  return (
    <section className="bg-white py-10" aria-label="Chiffres clés">
      <div className="container-page">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {trustStats.map((stat) => {
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
