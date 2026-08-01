import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { featuredLawyers, liveCounters } from "@/lib/data/home";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconClock,
  IconIncognito,
  IconSparkles,
  IconTrendingUp,
} from "@/components/ui/icons";

/**
 * Hero repris de la maquette de référence : panneau clair continu avec la
 * barre de navigation, texte à gauche, composition de formes organiques
 * superposées à droite. Les verts de la maquette sont transposés dans la
 * palette du projet (or / ambre, marine pour les surfaces profondes).
 */
export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-panel pt-12 pb-32 lg:pt-16 lg:pb-44">
      <HeroBackdrop />

      <div className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
          {/* ---------------- Colonne texte ---------------- */}
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-marine-950/8 bg-white/70 py-1.5 pr-4 pl-2 text-sm text-marine-700 backdrop-blur-sm">
              <span className="relative grid size-6 place-items-center">
                <span className="animate-pulse-ring absolute size-2.5 rounded-full bg-trust-500" />
                <span className="size-2.5 rounded-full bg-trust-500" />
              </span>
              <span className="font-medium">
                {liveCounters.lawyersOnline} avocats en ligne maintenant
              </span>
            </p>

            {/* Titre sur deux niveaux : ligne fine puis ligne grasse. */}
            <h1 className="mt-6 text-[2.6rem]/[1.08] font-medium text-marine-950 sm:text-6xl/[1.05] lg:text-[4.1rem]/[1.03]">
              <span className="block font-light text-marine-950/60">
              </span>
              <span className="block font-bold">
                Avocats et Conseils Juridiques{" "}
                <span className="relative whitespace-nowrap text-gold-600">
                  en un clic.
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-gold-500/70"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8c40-5 92-7 196-4"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg/relaxed text-marine-950/70">
              Décrivez votre problème juridique sans jargon et sans donner votre
              identité. Les avocats compétents vous répondent — vous choisissez
              qui vous rappelle.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/besoin/nouveau"
                className={buttonStyles({
                  size: "lg",
                  className: "bg-linear-to-r from-gold-400 to-gold-600",
                })}
              >
                Poser mon besoin
                <span className="hidden font-normal opacity-85 sm:inline">
                  (Gratuit &amp; Anonyme)
                </span>
                <IconArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/avocats/inscription"
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                Vous êtes avocat ? Rejoignez le réseau
              </Link>
            </div>

            {/* Preuve sociale immédiate */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {featuredLawyers.slice(0, 4).map((lawyer) => (
                    <span key={lawyer.slug} className="rounded-full ring-2 ring-panel">
                      <Avatar initials={lawyer.initials} size="sm" />
                    </span>
                  ))}
                  <span className="grid size-9 place-items-center rounded-full bg-gold-500 text-[0.7rem] font-bold text-marine-950 ring-2 ring-panel">
                    +7k
                  </span>
                </div>
                <p className="text-sm/tight text-marine-600">
                  <span className="font-semibold text-marine-950">7 000+ avocats</span>
                  <br />
                  déjà répertoriés
                </p>
              </div>

              <span className="hidden h-10 w-px bg-marine-950/12 sm:block" aria-hidden="true" />

              <div>
                <Rating value={4.9} />
                <p className="mt-0.5 text-sm text-marine-600">sur 3 400 avis certifiés</p>
              </div>
            </div>
          </div>

          {/* ---------------- Colonne visuelle ---------------- */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Décor du hero : illustration fournie, commutée par le thème                 */
/* -------------------------------------------------------------------------- */

function HeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Fond du panneau, calé sur la couleur de fond de l'illustration */}
      <div className="absolute inset-0 bg-panel" />

      {/*
        L'illustration est posée en background-image via la variable
        --hero-art : seule celle du thème actif est téléchargée, et la
        bascule est instantanée.
        Les fichiers vivent dans public/hero/ (or, marine, emeraude).
      */}
      <div
        className="absolute inset-y-0 -right-[18%] w-[92%] bg-contain bg-right bg-no-repeat opacity-35 sm:-right-[10%] sm:w-[74%] sm:opacity-70 lg:-right-[6%] lg:w-[64%] lg:opacity-100"
        style={{ backgroundImage: "var(--hero-art)" }}
      />
    </div>
  );
}

/** Cartes flottantes, posées devant l'illustration. */
function HeroVisual() {
  const lawyer = featuredLawyers[0];

  return (
    <div className=" relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Carte principale : aperçu d'une réponse d'avocat */}
      <div className="animate-fade-up rounded-3xl border border-white/70 bg-white/55 p-2 shadow-marine backdrop-blur-md [animation-delay:120ms]">
        <div className="rounded-[1.15rem] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar initials={lawyer.initials} size="lg" online={lawyer.online} />
              <div>
                <p className="flex items-center gap-1.5 font-serif text-lg font-bold text-marine-950">
                  {lawyer.name}
                  <IconBadgeCheck className="size-4.5 text-gold-500" />
                </p>
                <p className="text-sm text-marine-500">
                  {lawyer.specialties[0]} · {lawyer.city}
                </p>
                <Rating value={lawyer.rating} reviews={lawyer.reviews} className="mt-1.5" />
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-semibold text-trust-600 ring-1 ring-trust-500/25 ring-inset sm:block">
              Disponible
            </span>
          </div>

          <p className="mt-5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            « Votre situation relève d’une requalification. Avant toute
            démarche, réunissez vos trois derniers bulletins de paie — je vous
            explique la suite. »
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-marine-600">
              <IconClock className="size-4 text-gold-500" />
              {lawyer.responseTime}
            </span>
            <span className={buttonStyles({ size: "sm", variant: "marine" })}>
              Accepter le contact
            </span>
          </div>
        </div>
      </div>

      {/* Pastille anonymat */}
      <div className="animate-fade-up absolute -top-5 -left-4 hidden items-center gap-2 rounded-2xl bg-marine-950 px-3.5 py-2.5 shadow-marine sm:flex [animation-delay:260ms]">
        <IconIncognito className="size-4.5 text-gold-400" />
        <span className="text-sm font-semibold text-white">Profil anonyme</span>
      </div>

      {/* Compteur dynamique — module 8.2 */}
      <div className="animate-fade-up absolute -bottom-7 -left-2 flex items-center gap-3 rounded-2xl bg-marine-950 px-4 py-3 shadow-marine sm:-left-8 [animation-delay:380ms]">
        <span className="grid size-9 place-items-center rounded-xl bg-trust-500/15 text-trust-400">
          <IconTrendingUp className="size-4.5" />
        </span>
        <span className="text-sm/tight text-marine-200">
          <span className="block font-bold text-white">
            {liveCounters.needsSolvedToday} besoins résolus
          </span>
          aujourd’hui
        </span>
      </div>

      {/* Réponse moyenne */}
      <div className="animate-fade-up absolute -right-3 -bottom-10 hidden items-center gap-2.5 rounded-2xl bg-gold-500 px-4 py-3 shadow-gold lg:flex [animation-delay:500ms]">
        <IconSparkles className="size-4.5 text-marine-950" />
        <span className="text-sm/tight font-semibold text-marine-950">
          Réponse moyenne
          <span className="block text-lg leading-none">
            {liveCounters.averageResponse}
          </span>
        </span>
      </div>
    </div>
  );
}
