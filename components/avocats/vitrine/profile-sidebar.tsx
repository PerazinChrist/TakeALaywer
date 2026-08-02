import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { formatFcfa } from "@/lib/utils";
import type { FactIcon, LawyerProfile } from "@/lib/data/lawyer-profile";
import {
  IconAward,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconGlobe,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconScale,
  IconShieldCheck,
  IconUsers,
} from "@/components/ui/icons";

const factIcons: Record<FactIcon, typeof IconScale> = {
  scale: IconScale,
  mapPin: IconMapPin,
  building: IconBuilding,
  award: IconAward,
  clock: IconClock,
  globe: IconGlobe,
  calendar: IconCalendar,
  users: IconUsers,
};

/**
 * Colonne de gauche de la vitrine — équivalent du bloc « Informations
 * personnelles » de la maquette de référence : une carte blanche, une liste
 * d'icônes et de faits courts, un crayon de modification pour le propriétaire.
 */
export function ProfileSidebar({
  profile,
  editable = false,
}: {
  profile: LawyerProfile;
  editable?: boolean;
}) {
  const cheapest = Math.min(...profile.prestations.map((p) => p.price));

  return (
    <div className="space-y-5">
      <Card
        title={
          profile.type === "cabinet"
            ? "Informations du cabinet"
            : "Informations professionnelles"
        }
        editable={editable}
      >
        <ul className="space-y-3.5">
          {profile.facts.map((fact) => {
            const Icon = factIcons[fact.icon];
            return (
              <li key={fact.label} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
                <span className="text-sm/relaxed text-marine-800">
                  {fact.label}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Domaines d’intervention" editable={editable}>
        <ul className="flex flex-wrap gap-1.5">
          {profile.specialties.map((item) => (
            <li key={item}>
              <Link
                href={`/avocats?domaine=${encodeURIComponent(item)}`}
                className="inline-flex rounded-full bg-marine-50 px-3 py-1.5 text-xs font-medium text-marine-700 transition-colors hover:bg-gold-50 hover:text-gold-700"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Vérifications" editable={false}>
        <ul className="space-y-3">
          {[
            {
              label:
                profile.type === "cabinet"
                  ? "Registre de commerce contrôlé"
                  : "Carte professionnelle contrôlée",
              done: true,
            },
            { label: `Inscription au ${profile.bar} confirmée`, done: true },
            { label: "Identité du représentant vérifiée", done: true },
            { label: "Avis collectés après consultation réelle", done: true },
          ].map((row) => (
            <li key={row.label} className="flex items-start gap-3">
              <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-500" />
              <span className="text-sm/relaxed text-marine-800">{row.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Bloc marketplace : le prix d'entrée, puis l'action. */}
      <div className="rounded-3xl bg-marine-950 p-6 text-white lg:sticky lg:top-28">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-400 uppercase">
          Honoraires indicatifs
        </p>
        <p className="mt-3 font-serif text-3xl font-bold">
          dès {formatFcfa(cheapest)}
        </p>
        <p className="mt-2 text-sm/relaxed text-marine-200">
          Annoncés avant tout engagement. {profile.prestations.length} prestations
          au tarif affiché.
        </p>

        <dl className="mt-5 space-y-2.5 border-t border-white/12 pt-5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-marine-300">Délai de réponse</dt>
            <dd className="font-semibold">{profile.responseTime}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-marine-300">Langues</dt>
            <dd className="text-right font-semibold">
              {profile.languages.join(", ")}
            </dd>
          </div>
        </dl>

        <Link
          href={`/besoin/nouveau?avocat=${profile.slug}`}
          className={buttonStyles({ size: "sm", full: true, className: "mt-6" })}
        >
          Décrire mon besoin
        </Link>
        <a
          href="tel:+237600000000"
          className={buttonStyles({
            variant: "ghost",
            size: "sm",
            full: true,
            className: "mt-2.5",
          })}
        >
          <IconPhone className="size-4" />
          Appeler le secrétariat
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Card({
  title,
  editable,
  children,
}: {
  title: string;
  editable: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold text-marine-950">{title}</h2>
        {editable && (
          <button
            type="button"
            aria-label={`Modifier : ${title}`}
            className="grid size-8 shrink-0 place-items-center rounded-full text-marine-400 transition-colors hover:bg-marine-50 hover:text-gold-700"
          >
            <IconPencil className="size-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
