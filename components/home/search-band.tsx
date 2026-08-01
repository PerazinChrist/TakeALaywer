import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { cities, specialties } from "@/lib/data/home";
import {
  IconArrowRight,
  IconChevronDown,
  IconMapPin,
  IconScale,
  IconSearch,
  IconSparkles,
} from "@/components/ui/icons";

const frequentSearches = [
  "Licenciement",
  "Titre foncier",
  "Création de SARL",
  "Divorce",
  "Loyers impayés",
];

/**
 * Bande de recherche rapide, en débordement sur le hero.
 * Recherche par spécialité et par ville — module 3.3 (moteur de recherche).
 * Formulaire GET natif : fonctionne même sans JavaScript.
 */
export function SearchBand() {
  return (
    <section className="relative z-10 -mt-20 lg:-mt-28" aria-label="Recherche rapide">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-marine-950/6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.9fr)]">
          {/* Carte accent — point d'entrée guidé (règle des 3 secondes) */}
          <div className="relative isolate overflow-hidden bg-linear-to-br from-gold-300 via-gold-400 to-gold-600 p-7 lg:p-8">
            <div
              className="absolute -top-16 -right-12 -z-10 size-52 rounded-full bg-white/30 blur-2xl"
              aria-hidden="true"
            />
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-marine-900/75 uppercase">
              Diagnostic rapide
            </p>
            <div
              className="mt-3 h-0.5 w-10 rounded-full bg-marine-950/40"
              aria-hidden="true"
            />
            <h2 className="mt-4 font-serif text-2xl/tight font-bold text-marine-950">
              3 questions, une orientation immédiate
            </h2>
            <p className="mt-3 text-sm/relaxed text-marine-900/85">
              Vous ne savez pas si votre situation relève du droit du travail ou
              du droit des contrats ? Laissez-nous vous orienter.
            </p>
            <Link
              href="#diagnostic"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-marine-950 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <IconSparkles className="size-4 text-gold-400" />
              Lancer le diagnostic
            </Link>
          </div>

          {/* Moteur de recherche */}
          <div className="p-7 lg:p-8">
            <h2 className="font-serif text-xl font-bold text-marine-950">
              Trouvez un avocat près de vous
            </h2>

            <form action="/avocats" method="get" className="mt-5 flex flex-col gap-3 md:flex-row">
              <Field
                id="specialite"
                label="Domaine du droit"
                icon={<IconScale className="size-4.5" />}
              >
                <option value="">Tous les domaines</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Field>

              <Field id="ville" label="Ville" icon={<IconMapPin className="size-4.5" />}>
                <option value="">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Field>

              <button type="submit" className={buttonStyles({ size: "lg" })}>
                <IconSearch className="size-4.5" />
                Rechercher
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm text-marine-500">Recherches fréquentes :</span>
              {frequentSearches.map((term) => (
                <Link
                  key={term}
                  href={`/avocats?q=${encodeURIComponent(term)}`}
                  className="group inline-flex items-center gap-1 rounded-full bg-marine-50 px-3 py-1.5 text-sm font-medium text-marine-700 transition-colors hover:bg-gold-50 hover:text-gold-700"
                >
                  {term}
                  <IconArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gold-500">
        {icon}
      </span>
      <select
        id={id}
        name={id}
        defaultValue=""
        className="h-14 w-full cursor-pointer appearance-none rounded-2xl border border-marine-200 bg-white pr-11 pl-12 text-[0.95rem] font-medium text-marine-900 transition-colors hover:border-marine-300 focus:border-gold-500"
      >
        {children}
      </select>
      <IconChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-marine-400" />
    </div>
  );
}
