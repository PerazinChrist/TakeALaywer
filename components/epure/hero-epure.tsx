import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { FeaturedGuideSlide } from "@/components/epure/featured-guide-slide";
import { groupDigits } from "@/lib/utils";
import type { DirectoryEntry, GuideSummary, PlatformStats } from "@/lib/api/public";
import { IconArrowRight, IconFileText, IconSend } from "@/components/ui/icons";

/**
 * ÉCRAN 1 — l'essentiel en un coup d'œil.
 *
 * Composition reprise du hero de la page d'accueil : panneau clair continu
 * avec la barre de navigation, texte à gauche, carte flottante à droite. La
 * version épurée l'adoucit — illustration en retrait, une seule pastille
 * flottante — et remplace les deux boutons par les deux cartes d'action du
 * cahier des charges. La colonne visuelle accueille le guide en vedette.
 */
export function HeroEpure({
  lawyers,
  guides,
  stats,
}: {
  lawyers: DirectoryEntry[];
  guides: GuideSummary[];
  stats: PlatformStats;
}) {
  const online = lawyers.filter((lawyer) => lawyer.online).length;

  return (
    <section className="relative isolate overflow-hidden bg-panel pt-12 pb-28 lg:pt-16 lg:pb-36">
      <HeroBackdrop />

      <div className="container-page relative">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
          {/* ---------------- Colonne texte ---------------- */}
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-marine-950/8 bg-white/70 py-1.5 pr-4 pl-2 text-sm text-marine-700 backdrop-blur-sm">
              <span className="relative grid size-6 place-items-center">
                <span className="animate-pulse-ring absolute size-2.5 rounded-full bg-trust-500" />
                <span className="size-2.5 rounded-full bg-trust-500" />
              </span>
              <span className="font-medium">
                {online > 0
                  ? `${online} ${online > 1 ? "avocats" : "avocat"} en ligne maintenant`
                  : `${groupDigits(stats.directory)} avocats et cabinets vérifiés`}
              </span>
            </p>

            <h1 className="mt-6 text-[2.3rem]/[1.12] font-bold text-balance text-marine-950 sm:text-5xl/[1.08] lg:text-[3.1rem]/[1.06]">
              Vos démarches et besoins juridiques, traités par des{" "}
              <span className="relative whitespace-nowrap text-gold-600">
                avocats qualifiés.
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-gold-500/60"
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
            </h1>

            <p className="mt-8 max-w-xl text-lg/relaxed text-marine-950/70">
              Trouvez un avocat, posez une question anonyme ou consultez nos
              guides pratiques.
            </p>

            {/* Les deux choix. Toute la carte est cliquable. */}
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <ChoiceCard
                href="/besoin/nouveau"
                tone="gold"
                icon={<IconSend className="size-5.5" />}
                title="J’ai un besoin spécifique"
                description="Décrivez votre situation en 2 minutes. Recevez des réponses d’avocats."
                cta="Poser mon problème gratuitement"
                note="Gratuit & anonyme"
              />

              <ChoiceCard
                href="/guides"
                tone="marine"
                icon={<IconFileText className="size-5.5" />}
                title="Je cherche des réponses immédiates"
                description="Parcourez nos modèles de documents et guides pratiques rédigés par des experts."
                cta="Explorer les guides dès 250 FCFA"
                note="Téléchargement instantané"
              />
            </div>

            {/* Réassurance, sur une seule ligne. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {lawyers.slice(0, 4).map((lawyer) => (
                    <span
                      key={lawyer.slug}
                      className="rounded-full ring-2 ring-panel"
                    >
                      <Avatar
                        initials={lawyer.initials}
                        imageUrl={lawyer.avatarUrl}
                        size="sm"
                      />
                    </span>
                  ))}
                </div>
                <p className="text-sm text-marine-600">
                  <span className="font-semibold text-marine-950">
                    {groupDigits(stats.directory)} avocats
                  </span>{" "}
                  répertoriés
                </p>
              </div>

              <span
                className="hidden h-8 w-px bg-marine-950/12 sm:block"
                aria-hidden="true"
              />

              <div className="flex items-center gap-2">
                <Rating value={stats.averageRating} />
                <p className="text-sm text-marine-600">
                  sur {groupDigits(stats.reviews)} avis certifiés
                </p>
              </div>
            </div>
          </div>

          {/* ---------------- Colonne visuelle ---------------- */}
          <FeaturedGuideSlide guides={guides} />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Carte d'action principale.
 * Le CTA est un `span` et non un lien : la carte entière est déjà le lien,
 * imbriquer deux zones cliquables casserait la navigation au clavier.
 */
function ChoiceCard({
  href,
  tone,
  icon,
  title,
  description,
  cta,
  note,
}: {
  href: string;
  tone: "gold" | "marine";
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  note: string;
}) {
  const gold = tone === "gold";

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-3xl bg-white/80 p-6 shadow-card ring-1 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white ${
        gold
          ? "ring-gold-500/25 hover:ring-gold-500/50"
          : "ring-marine-950/8 hover:ring-marine-950/20"
      }`}
    >
      <span
        className={`grid size-11 place-items-center rounded-2xl ${
          gold
            ? "bg-gold-500/12 text-gold-700 ring-1 ring-gold-500/25 ring-inset"
            : "bg-marine-950/6 text-marine-800 ring-1 ring-marine-950/10 ring-inset"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <h2 className="mt-5 font-serif text-xl/snug font-bold text-balance text-marine-950">
        {title}
      </h2>

      <p className="mt-2.5 flex-1 text-sm/relaxed text-marine-600">
        {description}
      </p>

      <span
        className={buttonStyles({
          variant: gold ? "gold" : "outline",
          size: "sm",
          full: true,
          className: `mt-6 ${gold ? "" : "border-marine-950/15"}`,
        })}
      >
        {cta}
        <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>

      <span className="mt-2.5 text-center text-xs font-medium text-marine-500">
        {note}
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Décor du hero, repris de la page d'accueil : l'illustration du thème posée
 * en `background-image` (variable `--hero-art`, seul le fichier du thème actif
 * est téléchargé). Opacité réduite par rapport à la version d'origine — elle
 * doit rester un fond, pas un motif.
 */
function HeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-panel" />

      <div
        className="absolute inset-y-0 -right-[18%] w-[92%] bg-contain bg-right bg-no-repeat opacity-15 sm:-right-[10%] sm:w-[74%] sm:opacity-30 lg:-right-[6%] lg:w-[64%] lg:opacity-45"
        style={{ backgroundImage: "var(--hero-art)" }}
      />

      {/* Halos or très diffus, pour réchauffer le panneau sans le saturer. */}
      <div className="animate-float-slow absolute -top-40 -left-24 size-[32rem] rounded-full bg-gold-200/35 blur-[130px]" />
    </div>
  );
}
