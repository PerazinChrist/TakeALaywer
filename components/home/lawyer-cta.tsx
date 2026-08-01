import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconCrown,
  IconFileText,
  IconTrendingUp,
} from "@/components/ui/icons";

const benefits = [
  "Profil public optimisé pour le référencement Google",
  "Besoins qualifiés acheminés dans vos spécialités",
  "Publiez vos guides et fixez votre prix (70 % pour vous)",
  "Messagerie chiffrée et coffre-fort documentaire",
];

/**
 * CTA avocat — deuxième bouton de la landing page + module 2.3 (Offre Pionnière).
 * Seul bloc plein de la page : il reprend l'or de la carte accent de la
 * maquette et sert de point d'orgue avant le pied de page.
 */
export function LawyerCta() {
  return (
    <section className="bg-white pb-20 lg:pb-28" aria-labelledby="avocat-cta-titre">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-gold-300 via-gold-400 to-gold-600 px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div
            className="pointer-events-none absolute -top-32 -left-20 -z-10 size-96 rounded-full bg-white/40 blur-[100px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 -bottom-32 -z-10 size-96 rounded-full bg-gold-700/25 blur-[110px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.09] [background-image:radial-gradient(circle,#0f172a_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-marine-950/10 px-3.5 py-1.5 text-sm font-semibold text-marine-900 ring-1 ring-marine-950/20 ring-inset">
                <IconCrown className="size-4" />
                Offre Pionnière — 500 places
              </p>

              <h2
                id="avocat-cta-titre"
                className="mt-6 text-3xl/tight font-bold text-marine-950 sm:text-4xl/tight"
              >
                Vous êtes avocat ?
                <span className="block font-light text-marine-950/65">
                  Rejoignez le réseau avant vos confrères.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base/relaxed text-marine-900/85">
                Les 500 premiers avocats vérifiés obtiennent leur fiche, leurs
                crédits de réponse et leur espace de publication gratuitement,
                à vie. Ensuite, l’accès basculera sur un abonnement mensuel.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-[0.95rem] text-marine-900"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-marine-950/12 text-marine-900">
                      <IconCheck className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/avocats/inscription"
                  className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-marine-950 px-8 text-base font-semibold text-white shadow-[0_18px_40px_-16px_rgb(15_23_42/0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-marine-800"
                >
                  Rejoindre le réseau
                  <IconArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/avocats/espace-praticien"
                  className={buttonStyles({
                    variant: "outline",
                    size: "lg",
                    className:
                      "border-marine-950/25 bg-white/40 text-marine-950 hover:border-marine-950/50 hover:bg-white/70",
                  })}
                >
                  Découvrir l’espace praticien
                </Link>
              </div>
            </div>

            {/* Preuve de valeur pour l'avocat */}
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Kpi
                icon={<IconTrendingUp className="size-5" />}
                value="+38 %"
                label="de visibilité sur les recherches locales"
              />
              <Kpi
                icon={<IconFileText className="size-5" />}
                value="70 / 30"
                label="partage des revenus en votre faveur"
              />
              <Kpi
                icon={<IconBadgeCheck className="size-5" />}
                value="48h"
                label="délai moyen de vérification du dossier"
              />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-sm">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-marine-950 text-gold-300">
        {icon}
      </span>
      <div className="flex flex-col">
        <dt className="order-2 text-sm/snug text-marine-800">{label}</dt>
        <dd className="order-1 font-serif text-2xl font-bold text-marine-950">{value}</dd>
      </div>
    </div>
  );
}
