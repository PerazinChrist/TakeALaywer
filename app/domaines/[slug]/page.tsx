import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { LawyerCard } from "@/components/public/lawyer-card";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, collectionLd, directoryPaths, itemListLd } from "@/lib/seo/structured-data";
import { fetchDirectory, fetchGuides } from "@/lib/api/public";
import { getPracticeArea, practiceAreas } from "@/lib/data/practice-areas";
import { groupDigits } from "@/lib/utils";
import { IconArrowRight, IconCheck, IconSend } from "@/components/ui/icons";

type Params = { params: Promise<{ slug: string }> };

/** Les praticiens et les guides listés changent avec la base. */
export const dynamic = "force-dynamic";

/**
 * Les dix domaines sont connus à la compilation : les déclarer permet à Next de
 * traiter une URL inconnue comme un 404 sans interroger l'API.
 */
export function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) return { title: "Domaine introuvable" };

  return pageMetadata({
    title: `${area.title} — avocats et guides`,
    description: `${area.tagline} Trouvez un avocat qui pratique le ${area.title.toLowerCase()} et consultez les guides du domaine.`,
    path: `/domaines/${area.slug}`,
  });
}

export default async function DomainePage({ params }: Params) {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) notFound();

  // Deux lectures indépendantes : les lancer en parallèle évite d'additionner
  // leurs latences avant le premier octet envoyé au visiteur.
  const [directory, library] = await Promise.all([
    fetchDirectory({ specialty: area.specialty, perPage: 6, sort: "featured" }),
    fetchGuides({ category: area.specialty, perPage: 3, sort: "popular" }),
  ]);

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-14 lg:py-20">
            <nav aria-label="Fil d’Ariane" className="text-sm text-marine-500">
              <Link href="/domaines" className="hover:text-gold-700">
                Domaines du droit
              </Link>
            </nav>

            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-marine-950 sm:text-4xl/tight lg:text-5xl/tight">
              {area.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[1.15rem]/relaxed text-gold-700">{area.tagline}</p>

            <div className="mt-6 max-w-3xl space-y-4">
              {area.intro.map((paragraph) => (
                <p key={paragraph} className="text-[1.05rem]/relaxed text-marine-600">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/besoin/nouveau?domaine=${encodeURIComponent(area.specialty)}`}
                className={buttonStyles()}
              >
                <IconSend className="size-4" />
                Poser ma question
              </Link>
              <Link
                href={`/avocats?domaine=${encodeURIComponent(area.specialty)}`}
                className={buttonStyles({ variant: "outline" })}
              >
                {directory.total > 0
                  ? `Voir les ${groupDigits(directory.total)} praticiens`
                  : "Parcourir l’annuaire"}
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Situations concrètes : le visiteur doit se reconnaître avant de lire
            la moindre définition juridique. */}
        <section className="container-page py-14 lg:py-20" aria-labelledby="situations">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 id="situations" className="font-serif text-2xl font-bold text-marine-950">
                Ces situations vous parlent ?
              </h2>
              <ul className="mt-6 space-y-3">
                {area.situations.map((situation) => (
                  <li
                    key={situation}
                    className="flex items-start gap-3 rounded-2xl bg-white p-4 text-[0.95rem]/relaxed text-marine-700 ring-1 ring-marine-950/6"
                  >
                    <IconCheck className="mt-1 size-4 shrink-0 text-trust-600" />
                    {situation}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-marine-950">
                Les questions qu’on se pose
              </h2>
              <ul className="mt-6 space-y-3">
                {area.questions.map((question) => (
                  <li key={question}>
                    <Link
                      href={`/guides?domaine=${encodeURIComponent(area.specialty)}`}
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-marine-950/8 bg-white p-4 transition-colors hover:border-gold-500/40 hover:bg-gold-50"
                    >
                      <span className="text-[0.95rem]/relaxed text-marine-800">{question}</span>
                      <IconArrowRight className="mt-1 size-4 shrink-0 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Praticiens du domaine */}
        {directory.items.length > 0 && (
          <section className="bg-white py-14 lg:py-20" aria-labelledby="praticiens">
            <div className="container-page">
              <SectionHeading
                eyebrow="Annuaire vérifié"
                title={
                  <span id="praticiens">
                    Les avocats qui pratiquent ce domaine
                  </span>
                }
                description="Carte professionnelle et inscription au Barreau contrôlées avant publication."
                action={
                  <Link
                    href={`/avocats?domaine=${encodeURIComponent(area.specialty)}`}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    Tous les praticiens
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                }
              />

              <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {directory.items.map((lawyer) => (
                  <LawyerCard key={lawyer.slug} lawyer={lawyer} />
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Guides du domaine */}
        {library.items.length > 0 && (
          <section className="container-page py-14 lg:py-20" aria-labelledby="guides-domaine">
            <SectionHeading
              eyebrow="Bibliothèque"
              title={<span id="guides-domaine">Comprendre avant de consulter</span>}
              description="Des guides signés par des avocats, pour préparer votre dossier ou régler la situation seul."
              action={
                <Link
                  href={`/guides?domaine=${encodeURIComponent(area.specialty)}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Tous les guides
                  <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {library.items.map((guide) => (
                <li key={guide.slug}>
                  <GuideShowcaseCard guide={guide} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Les autres domaines : maillage interne pour le référencement. */}
        <section className="border-t border-marine-950/8 bg-white py-12" aria-labelledby="autres">
          <div className="container-page">
            <h2
              id="autres"
              className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase"
            >
              Les autres domaines
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {practiceAreas
                .filter((entry) => entry.slug !== area.slug)
                .map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/domaines/${entry.slug}`}
                      className="text-sm text-marine-600 transition-colors hover:text-gold-700"
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileActionBar />

      {/* Ces pages n'avaient aucun balisage — pas même un fil d'Ariane. Ce sont
          pourtant les seules pages thématiques indexables du site, celles qui
          visent « avocat en droit du travail ». */}
      <JsonLd
        data={[
          collectionLd({
            name: area.title,
            description: area.tagline,
            path: `/domaines/${area.slug}`,
          }),
          itemListLd(
            `Avocats en ${area.title.toLowerCase()}`,
            directoryPaths(directory.items),
          ),
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Domaines du droit", path: "/domaines" },
            { name: area.title, path: `/domaines/${area.slug}` },
          ]),
        ]}
      />
    </>
  );
}
