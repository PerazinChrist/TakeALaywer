"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { OrientationSkeleton } from "@/components/ui/skeleton";
import { diagnosticSteps, type DiagnosticOption } from "@/lib/data/home";
import { facetMap } from "@/lib/utils";
import type { Facet, PlatformStats } from "@/lib/api/public";
import { cn, groupDigits } from "@/lib/utils";
import {
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconFileText,
  IconIncognito,
  IconSend,
  IconSparkles,
  IconUsers,
} from "@/components/ui/icons";

type Orientation = {
  headline: string;
  reason: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

/** Traduit les 3 réponses en une orientation concrète. */
function buildOrientation(answers: DiagnosticOption[]): Orientation {
  const [domain, urgency, intent] = answers;
  const specialty = domain.meta;
  const query = `?domaine=${encodeURIComponent(specialty)}`;

  if (intent.meta === "guides") {
    return {
      headline: `Commencez par comprendre vos droits en ${specialty.toLowerCase()}`,
      reason: `Des guides rédigés par des avocats couvrent votre cas. Si la situation se durcit, vous pourrez déposer un besoin en un clic (${urgency.meta.toLowerCase()}).`,
      primary: { label: "Voir les guides du domaine", href: `/guides${query}` },
      secondary: { label: "Parler à un avocat", href: `/besoin/nouveau${query}` },
    };
  }

  if (intent.meta === "document") {
    return {
      headline: "Faites relire votre document par un avocat du domaine",
      reason: `Déposez le document de façon anonyme dans le coffre-fort sécurisé : seuls les avocats en ${specialty.toLowerCase()} y auront accès, après votre accord.`,
      primary: { label: "Déposer mon document", href: `/besoin/nouveau${query}&type=relecture` },
      secondary: { label: "Voir les guides du domaine", href: `/guides${query}` },
    };
  }

  return {
    headline: `Parlez à un avocat en ${specialty.toLowerCase()}`,
    reason: `Votre besoin est marqué « ${urgency.meta.toLowerCase()} » : il sera acheminé en priorité vers les avocats compétents, qui vous répondront sans connaître votre identité.`,
    primary: { label: "Poser mon besoin (gratuit)", href: `/besoin/nouveau${query}` },
    secondary: { label: "Parcourir les avocats", href: `/avocats${query}` },
  };
}

/**
 * Composant « Diagnostic Rapide » — directive-ui.md § 1.
 *
 * Mini-questionnaire en 3 clics qui oriente vers les guides ou les avocats. Les
 * questions sont éditoriales ; les effectifs annoncés sous chaque domaine sont
 * comptés en base, sans quoi le diagnostic promettrait des avocats qui
 * n'existent pas.
 */
export function QuickDiagnostic({
  specialties,
  stats,
}: {
  specialties: Facet[];
  stats: PlatformStats;
}) {
  const [answers, setAnswers] = useState<DiagnosticOption[]>([]);
  const counts = facetMap(specialties);

  const index = answers.length;
  const done = index >= diagnosticSteps.length;
  const current = done ? null : diagnosticSteps[index];
  const progress = (index / diagnosticSteps.length) * 100;

  return (
    <section
      id="diagnostic"
      className="relative isolate overflow-hidden bg-white py-20 lg:py-28"
      aria-labelledby="diagnostic-titre"
    >
      {/* Voiles dorés, écho discret des formes du hero */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 size-[30rem] rounded-full bg-gold-200/45 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -bottom-40 -z-10 size-[28rem] rounded-full bg-gold-100/60 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Diagnostic rapide"
              title={
                <span id="diagnostic-titre">
                  Vous ne savez pas où commencer ? Trois questions suffisent.
                </span>
              }
              description="Pas de jargon, pas de formulaire interminable. En trois clics, nous identifions le domaine du droit concerné et l’action la plus utile pour vous."
            />

            <ul className="mt-9 space-y-3.5">
              {[
                { icon: IconIncognito, text: "Aucune inscription, aucune donnée personnelle" },
                { icon: IconClock, text: "Moins de 30 secondes" },
                {
                  icon: IconUsers,
                  text: `${groupDigits(stats.directory)} avocats et cabinets vérifiés`,
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-marine-700">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600 ring-1 ring-gold-500/15 ring-inset">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[0.95rem]">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ------------------------- Widget ------------------------- */}
          <div className="rounded-3xl bg-panel p-2 shadow-card ring-1 ring-marine-950/6">
            <div className="rounded-[1.15rem] bg-white p-6 sm:p-8">
              {/* Progression */}
              <div className="flex items-center justify-between gap-4">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-400 uppercase">
                  {done ? "Résultat" : `Étape ${index + 1} sur ${diagnosticSteps.length}`}
                </p>
                {answers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers([])}
                    className="text-sm font-medium text-marine-500 underline decoration-marine-300 underline-offset-4 transition-colors hover:text-gold-600"
                  >
                    Recommencer
                  </button>
                )}
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-marine-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-gold-400 to-gold-600 transition-[width] duration-500 ease-out"
                  style={{ width: `${done ? 100 : progress}%` }}
                />
              </div>

              {current ? (
                <div key={index} className="animate-fade-up mt-7">
                  <h3 className="font-serif text-xl/snug font-bold text-marine-950 sm:text-2xl/snug">
                    {current.question}
                  </h3>
                  <p className="mt-2 text-sm text-marine-500">{current.helper}</p>

                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {current.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAnswers([...answers, option])}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-marine-200 bg-white px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-50"
                      >
                        <span>
                          <span className="block text-[0.95rem] font-semibold text-marine-900">
                            {option.label}
                          </span>
                          {index === 0 && (
                            <span className="mt-0.5 block text-xs text-marine-500">
                              {counts[option.meta] ?? 0} avocats disponibles
                            </span>
                          )}
                        </span>
                        <IconChevronRight className="size-4 shrink-0 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
                      </button>
                    ))}
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => setAnswers(answers.slice(0, -1))}
                      className="mt-5 text-sm font-medium text-marine-500 transition-colors hover:text-marine-900"
                    >
                      ← Question précédente
                    </button>
                  )}
                </div>
              ) : (
                <DiagnosticResult answers={answers} counts={counts} stats={stats} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagnosticResult({
  answers,
  counts,
  stats,
}: {
  answers: DiagnosticOption[];
  counts: Record<string, number>;
  stats: PlatformStats;
}) {
  // Court temps d'analyse simule le routage vers la bonne specialite et evite
  // un basculement brutal de l'interface — directive-ui.md § 5.
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 750);
    return () => clearTimeout(timer);
  }, []);

  const orientation = buildOrientation(answers);
  const domain = answers[0];
  const urgency = answers[1];

  const urgent = urgency.meta === "Urgent" || urgency.meta === "Très urgent";

  if (analyzing) return <OrientationSkeleton />;

  return (
    <div className="animate-fade-up mt-7" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-500/10 px-3 py-1 text-xs font-semibold text-trust-600 ring-1 ring-trust-500/25 ring-inset">
          <IconCheck className="size-3.5" />
          {domain.meta}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
            urgent
              ? "bg-gold-500/10 text-gold-700 ring-gold-500/30"
              : "bg-marine-50 text-marine-600 ring-marine-950/8",
          )}
        >
          <IconClock className="size-3.5" />
          {urgency.meta}
        </span>
      </div>

      <h3 className="mt-4 font-serif text-xl/snug font-bold text-marine-950 sm:text-2xl/snug">
        {orientation.headline}
      </h3>
      <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">{orientation.reason}</p>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link href={orientation.primary.href} className={buttonStyles({ full: true })}>
          <IconSend className="size-4" />
          {orientation.primary.label}
        </Link>
        <Link
          href={orientation.secondary.href}
          className={buttonStyles({ variant: "outline", full: true })}
        >
          {orientation.secondary.label}
          <IconArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl bg-marine-50 p-4 sm:grid-cols-3">
        <Metric
          icon={<IconUsers className="size-4" />}
          value={`${counts[domain.meta] ?? 0}`}
          label="avocats du domaine"
        />
        <Metric
          icon={<IconClock className="size-4" />}
          value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "—"}
          label="note moyenne"
        />
        <Metric
          icon={<IconFileText className="size-4" />}
          value={groupDigits(stats.guides)}
          label="guides disponibles"
        />
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs/relaxed text-marine-500">
        <IconSparkles className="mt-0.5 size-3.5 shrink-0 text-gold-500" />
        Cette orientation est indicative et ne constitue pas une consultation
        juridique. Seul un avocat inscrit au Barreau peut qualifier votre dossier.
      </p>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-gold-600 ring-1 ring-marine-950/6 ring-inset">
        {icon}
      </span>
      <span className="text-sm/tight">
        <span className="block font-bold text-marine-950">{value}</span>
        <span className="text-marine-500">{label}</span>
      </span>
    </div>
  );
}
