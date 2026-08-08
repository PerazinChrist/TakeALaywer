import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { GuidePrice, GuideShowcaseCard } from "@/components/public/guide-card";
import { GuideOutline } from "@/components/public/guide-outline";
import { GuidePaywall } from "@/components/public/guide-paywall";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, guideLd } from "@/lib/seo/structured-data";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { buttonStyles } from "@/components/ui/button";
import { UnlockButton } from "@/components/compte/unlock-button";
import { fetchGuide, type GuideDetail } from "@/lib/api/public";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { groupDigits } from "@/lib/utils";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconClock,
  IconMapPin,
  IconMessage,
  IconShieldCheck,
  IconTrendingUp,
} from "@/components/ui/icons";

type Params = { params: Promise<{ slug: string }> };

/** Le contenu servi dépend de l'état de publication : rien à pré-générer. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchGuide(slug);

  if (!guide) return { title: "Guide introuvable" };

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    publishedTime: guide.publishedAt,
    authors: [guide.author.name],
  });
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;

  // Les deux lectures sont mémoïsées pour ce rendu : `generateMetadata` a déjà
  // demandé le guide, et l'en-tête demandera la session. Rien n'est appelé deux
  // fois côté WordPress.
  const [guide, session] = await Promise.all([fetchGuide(slug), fetchCurrentClient()]);

  if (!guide) notFound();

  const { reading } = guide;
  const signedIn = session !== null;

  /*
   * Données structurées — l'article et son fil d'Ariane.
   *
   * `isAccessibleForFree` et `hasPart` décrivent le paywall au format que Google
   * attend. Sans eux, un robot qui ne voit que l'extrait considère la page comme
   * du contenu tronqué ; avec eux, il comprend qu'il s'agit d'un contenu payant
   * légitime et n'en pénalise pas l'indexation.
   */
  const structuredData = [
    guideLd(guide),
    breadcrumbLd([
      { name: "Accueil", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: guide.category, path: `/guides?domaine=${encodeURIComponent(guide.category)}` },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ]),
  ];

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        {/* En-tête de l'article */}
        <header className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-12 lg:py-16">
            <nav aria-label="Fil d’Ariane" className="text-sm text-marine-500">
              <Link href="/guides" className="hover:text-gold-700">
                Bibliothèque
              </Link>
              <span aria-hidden="true"> · </span>
              <Link
                href={`/guides?domaine=${encodeURIComponent(guide.category)}`}
                className="hover:text-gold-700"
              >
                {guide.category}
              </Link>
            </nav>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <GuidePrice guide={guide} />
              <span className="rounded-full bg-marine-50 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-marine-600 uppercase ring-1 ring-marine-950/6 ring-inset">
                {guide.kind === "modele" ? "Modèle d’acte" : "Guide pratique"}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl font-serif text-3xl/tight font-bold text-balance text-marine-950 sm:text-4xl/tight">
              {guide.title}
            </h1>

            <p className="mt-5 max-w-3xl text-[1.05rem]/relaxed text-marine-600">
              {guide.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-marine-500">
              <span className="inline-flex items-center gap-1.5">
                <IconClock className="size-4 text-gold-600" />
                {reading.readingTime} min de lecture
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconTrendingUp className="size-4 text-trust-600" />
                {groupDigits(guide.downloads)} lectures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconShieldCheck className="size-4 text-trust-600" />
                Publié après vérification du compte
              </span>
            </div>
          </div>
        </header>

        <div className="container-page py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            {/* Colonne de lecture */}
            <article>
              {guide.owned && <OwnedBanner />}

              <div className="prose-guide max-w-none" dangerouslySetInnerHTML={{ __html: reading.html }} />

              {reading.locked && <GuidePaywall guide={guide} signedIn={signedIn} />}

              {/* Un guide gratuit se lit sans compte : le proposer à la
                  bibliothèque n'est donc pas un péage, seulement le moyen de le
                  retrouver plus tard. D'où un encart discret, en fin de lecture,
                  plutôt qu'un bloc de déblocage. */}
              {guide.free && !guide.owned && (
                <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 ring-1 ring-marine-950/6">
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-bold text-marine-950">
                      Garder ce guide sous la main
                    </p>
                    <p className="mt-1 text-sm/relaxed text-marine-600">
                      Rangé dans votre espace personnel, il reste accessible depuis
                      n’importe quel appareil.
                    </p>
                  </div>

                  {signedIn ? (
                    <UnlockButton slug={guide.slug} price={guide.price} free />
                  ) : (
                    <Link
                      href={`/compte/inscription?suite=${encodeURIComponent(`/guides/${guide.slug}`)}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Créer mon espace
                      <IconArrowRight className="size-4" />
                    </Link>
                  )}
                </section>
              )}

              <AuthorCard guide={guide} />
            </article>

            {/* Colonne latérale : sommaire, puis auteur sur grand écran */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <GuideOutline outline={reading.outline} locked={reading.locked} />

              <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-marine-950/6">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                  Ce document
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Domaine" value={guide.category} />
                  <Row label="Mots" value={groupDigits(reading.words)} />
                  <Row
                    label="Accès"
                    value={guide.free ? "Lecture libre" : `${reading.previewRatio} % lisible`}
                  />
                  <Row label="Mis à jour" value={guide.updatedAt} />
                </dl>
              </div>
            </aside>
          </div>

          {/* Boucle de découverte — directive-ui.md § 2 */}
          {guide.related.length > 0 && (
            <section className="mt-16 border-t border-marine-950/8 pt-12" aria-labelledby="suite">
              <h2 id="suite" className="font-serif text-2xl font-bold text-marine-950">
                À lire ensuite
              </h2>
              <p className="mt-2 text-marine-600">
                Du même auteur, ou sur le même domaine du droit.
              </p>

              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {guide.related.map((related) => (
                  <li key={related.slug}>
                    <GuideShowcaseCard guide={related} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />

      <JsonLd data={structuredData} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Rappel affiché en tête d'un guide acheté.
 *
 * Sans lui, un lecteur revenu trois mois plus tard ne verrait aucune différence
 * entre un guide qu'il a payé et un guide gratuit : le texte est entier dans les
 * deux cas, et il pourrait croire l'avoir perdu ou payé pour rien.
 */
function OwnedBanner() {
  return (
    <p className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-trust-500/10 px-5 py-4 text-sm/relaxed text-marine-800 ring-1 ring-trust-500/25 ring-inset">
      <IconCheck className="size-4.5 shrink-0 text-trust-600" />
      <span className="min-w-0 flex-1 font-medium">
        Ce document vous appartient — vous le lisez en entier, autant de fois que
        vous le souhaitez.
      </span>
      <Link
        href="/compte"
        className="shrink-0 font-semibold text-trust-700 underline underline-offset-2 hover:text-trust-800"
      >
        Ma bibliothèque
      </Link>
    </p>
  );
}

/** Carte auteur en fin d'article — directive-ui.md § 2. */
function AuthorCard({ guide }: { guide: GuideDetail }) {
  const { author } = guide;

  return (
    <section className="mt-12 rounded-3xl bg-white p-6 ring-1 ring-marine-950/6 sm:p-8">
      <div className="flex flex-wrap items-start gap-5">
        <Avatar initials={author.initials} imageUrl={author.avatarUrl} size="lg" />

        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-400 uppercase">
            Rédigé par
          </p>

          <h2 className="mt-1.5 flex flex-wrap items-center gap-1.5 font-serif text-xl font-bold text-marine-950">
            <Link href={`/avocats/${author.slug}`} className="hover:text-gold-700">
              {author.name}
            </Link>
            {author.verified && <IconBadgeCheck className="size-4.5 text-gold-500" />}
          </h2>

          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-marine-500">
            <IconMapPin className="size-3.5" />
            {author.type === "cabinet" ? "Cabinet" : "Avocat"} à {author.city}
          </p>

          {author.headline && (
            <p className="mt-3 text-[0.95rem]/relaxed text-marine-700">{author.headline}</p>
          )}

          {author.rating > 0 && (author.reviewsCount ?? 0) > 0 && (
            <Rating value={author.rating} reviews={author.reviewsCount} className="mt-3" compact />
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/besoin/nouveau?avocat=${encodeURIComponent(author.slug)}`}
              className={buttonStyles({ size: "sm" })}
            >
              <IconMessage className="size-4" />
              Poser une question
            </Link>
            <Link
              href={`/avocats/${author.slug}`}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Voir la fiche
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-marine-500">{label}</dt>
      <dd className="text-right font-medium text-marine-900">{value}</dd>
    </div>
  );
}
