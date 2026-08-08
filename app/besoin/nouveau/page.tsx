import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { NeedForm, type NeedTarget } from "@/components/besoin/need-form";
import { PlatformNotice } from "@/components/public/platform-notice";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { fetchHome } from "@/lib/api/public";
import { fetchVitrine } from "@/lib/api/vitrine";
import { practiceAreas } from "@/lib/data/practice-areas";
import { IconArrowRight, IconShieldCheck, IconUsers } from "@/components/ui/icons";

/** Le formulaire dépend de la session et du cabinet visé : rien à pré-générer. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Poser mon problème",
  description:
    "Décrivez votre situation en quelques lignes : posez-la à la communauté, ou adressez-la directement à un avocat ou un cabinet vérifié.",
  alternates: { canonical: "/besoin/nouveau" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NouveauBesoinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const lawyerSlug = single(params.avocat);
  const situation = single(params.situation);

  // Trois lectures indépendantes : elles partent ensemble plutôt qu'en file.
  const [session, home, vitrine] = await Promise.all([
    fetchCurrentClient(),
    fetchHome(),
    lawyerSlug ? fetchVitrine(lawyerSlug) : Promise.resolve(null),
  ]);

  const target: NeedTarget | null = vitrine
    ? {
        slug: vitrine.profile.slug,
        name: vitrine.profile.name,
        initials: vitrine.profile.initials,
        subtitle: vitrine.profile.subtitle,
        city: vitrine.profile.city,
        avatarUrl: vitrine.profile.avatarUrl,
      }
    : null;

  // Les domaines viennent des effectifs réels de l'annuaire ; le référentiel
  // éditorial ne sert que de repli quand aucune vitrine n'est encore publiée.
  const specialties =
    home.facets.specialties.length > 0
      ? home.facets.specialties.map((facet) => facet.value)
      : practiceAreas.map((area) => area.specialty);

  const cities = home.facets.cities.map((facet) => facet.value);

  // `?situation=` arrive des cartes « par situation » de l'accueil et des pages
  // de domaine : le slug y est celui du domaine, pas son libellé.
  const defaultSpecialty =
    single(params.domaine) ||
    practiceAreas.find((area) => area.slug === situation)?.specialty ||
    "";

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          <PageHeaderBackdrop image="/headers/avocats.webp" position="center 45%" veil={0.2} priority />

          <div className="container-page py-14 lg:py-18">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Poser mon problème
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight">
              {target
                ? `Décrivez votre situation à ${target.name}`
                : "Racontez votre situation, quelqu’un la connaît déjà"}
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              {target
                ? "Votre message part directement à ce cabinet et n’est visible de personne d’autre. Vous pouvez aussi choisir de le poser à la communauté."
                : "Publiez votre problème dans l’espace communautaire, ou adressez-le en privé à un cabinet. Dans les deux cas, vous êtes prévenu dès qu’on vous répond."}
            </p>
          </div>
        </header>

        {/* Voir `app/avocats/page.tsx` : sans `relative`, l'en-tête positionné
            ci-dessus recouvre la partie chevauchante de la carte. */}
        <div className="relative z-10 container-page -mt-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
              {/* Avant le formulaire, pas après : c'est la page où l'on
                  s'apprête à décrire une situation personnelle. */}
              <PlatformNotice className="mb-6 w-full" />

              <NeedForm
                signedIn={session !== null}
                target={target}
                specialties={specialties}
                cities={cities}
                defaultSpecialty={defaultSpecialty}
              />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28">
              <Aside
                icon={<IconShieldCheck className="size-5" />}
                title="Ce qui est vu, et par qui"
              >
                <ul className="space-y-2.5 text-sm/relaxed text-marine-700">
                  <li>
                    Un problème posé à la communauté est public : écrivez les
                    faits, jamais vos numéros de compte ni vos pièces d’identité.
                  </li>
                  <li>
                    Un problème adressé à un cabinet n’est lu que par lui, dans
                    une conversation privée.
                  </li>
                  <li>
                    Vous restez « Membre » si vous le souhaitez : votre
                    pseudonyme n’est alors affiché nulle part.
                  </li>
                </ul>
              </Aside>

              <Aside icon={<IconUsers className="size-5" />} title="Voir ce qui se dit déjà">
                <p className="text-sm/relaxed text-marine-700">
                  Votre question a peut-être déjà sa réponse. L’espace
                  communautaire rassemble les problèmes posés et les réponses
                  des membres comme des avocats vérifiés.
                </p>

                <Link
                  href="/communaute"
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800"
                >
                  Parcourir l’espace communautaire
                  <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Aside>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Aside({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
      <h2 className="flex items-center gap-2.5 font-serif text-lg font-bold text-marine-950">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-700"
          aria-hidden="true"
        >
          {icon}
        </span>
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Un paramètre d'URL répété (`?ville=A&ville=B`) ne doit pas casser la page. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
