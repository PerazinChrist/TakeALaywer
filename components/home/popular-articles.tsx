import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { formatFcfa, groupDigits } from "@/lib/utils";
import type { GuideDetail, GuideSummary, PlatformStats } from "@/lib/api/public";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconClock,
  IconCrown,
  IconLock,
  IconMessage,
  IconTrendingUp,
} from "@/components/ui/icons";

/**
 * Section « Articles & Guides Populaires » — module 3.
 *
 * Met en scène le paywall (directive-ui.md § 4) sur un guide payant réel : le
 * texte affiché est l'extrait que l'API a bien voulu livrer, et les sections
 * annoncées comme verrouillées le sont réellement côté serveur.
 */
export function PopularArticles({
  featured,
  guides,
  stats,
}: {
  featured: GuideDetail | null;
  guides: GuideSummary[];
  stats: PlatformStats;
}) {
  const others = guides.filter((guide) => guide.slug !== featured?.slug).slice(0, 3);

  if (!featured && others.length === 0) return null;

  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="guides-titre">
      <div className="container-page">
        <SectionHeading
          eyebrow="Articles & guides populaires"
          title={<span id="guides-titre">Résolvez seul, ou venez préparé</span>}
          description="Des guides rédigés et signés par des avocats vérifiés. Certains sont gratuits, d’autres se débloquent dès 250 FCFA."
          action={
            <Link href="/guides" className={buttonStyles({ variant: "outline", size: "sm" })}>
              Tous les guides
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {featured && <FeaturedGuide guide={featured} />}

          <div className={featured ? "flex flex-col gap-4 lg:col-span-5" : "grid gap-4 lg:col-span-12 lg:grid-cols-3"}>
            {others.map((guide) => (
              <GuideShowcaseCard key={guide.slug} guide={guide} />
            ))}

            <Link
              href="/guides"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-dashed border-marine-300 px-5 py-4 text-sm font-semibold text-marine-700 transition-colors hover:border-gold-500 hover:bg-gold-50 hover:text-gold-700"
            >
              {groupDigits(Math.max(0, stats.guides - others.length - (featured ? 1 : 0)))} autres
              guides publiés sur la plateforme
              <IconArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Guide mis en avant, avec son extrait et le bloc de déblocage.
 *
 * Le dégradé qui ferme l'extrait est un effet visuel, pas une protection : la
 * coupe a déjà eu lieu côté serveur, et le HTML masqué n'a jamais été envoyé.
 */
function FeaturedGuide({ guide }: { guide: GuideDetail }) {
  const locked = guide.reading.outline.filter((section) => section.locked);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl bg-panel ring-1 ring-marine-950/8 lg:col-span-7">
      <div
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-gold-200/50 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="premium" className="bg-gold-500 text-marine-950 ring-gold-400">
            <IconCrown className="size-3.5" />
            Guide premium
          </Badge>
          <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-marine-600 uppercase ring-1 ring-marine-950/6 ring-inset">
            {guide.category}
          </span>
        </div>

        <h3 className="mt-5 font-serif text-2xl/snug font-bold text-marine-950 sm:text-3xl/snug">
          <Link href={`/guides/${guide.slug}`} className="hover:text-gold-700">
            {guide.title}
          </Link>
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-marine-600">
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="size-4 text-gold-600" />
            {guide.reading.readingTime} min de lecture
          </span>
          {guide.downloads > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <IconTrendingUp className="size-4 text-trust-600" />
              {groupDigits(guide.downloads)} lectures
            </span>
          )}
        </div>

        {/* L'extrait réel, tel que l'API l'a coupé. */}
        <div className="relative mt-6 max-h-64 overflow-hidden">
          <div
            className="prose-guide text-[0.95rem]"
            dangerouslySetInnerHTML={{ __html: guide.reading.html }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-panel to-transparent"
            aria-hidden="true"
          />
        </div>

        {locked.length > 0 && (
          <div className="mt-5 rounded-2xl border border-gold-500/25 bg-gold-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-gold-800">
              <IconLock className="size-4" />
              {locked.length} {locked.length > 1 ? "parties restent" : "partie reste"} à débloquer
            </p>
            <ul className="mt-3 space-y-2">
              {locked.slice(0, 4).map((section) => (
                <li
                  key={section.title}
                  className="flex items-start gap-2.5 text-sm text-marine-800"
                >
                  <IconLock className="mt-0.5 size-3.5 shrink-0 text-gold-600" />
                  {section.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href={`/guides/${guide.slug}`} className={buttonStyles()}>
            Débloquer pour {formatFcfa(guide.price)}
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-xs/relaxed text-marine-500">
            Paiement Mobile Money ou carte bancaire.
            <br className="hidden sm:block" />
            {guide.reading.previewRatio} % du guide est lisible gratuitement.
          </p>
        </div>
      </div>

      {/* Carte auteur — directive-ui.md § 2 */}
      <div className="relative border-t border-marine-950/8 bg-white p-5 sm:px-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/avocats/${guide.author.slug}`} className="flex items-center gap-3">
            <Avatar initials={guide.author.initials} imageUrl={guide.author.avatarUrl} />
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-marine-950">
                {guide.author.name}
                {guide.author.verified && <IconBadgeCheck className="size-4 text-gold-500" />}
              </span>
              <span className="block text-sm text-marine-600">
                {guide.author.type === "cabinet" ? "Cabinet" : "Avocat"} à {guide.author.city}
              </span>
            </span>
          </Link>

          <Link
            href={`/besoin/nouveau?avocat=${encodeURIComponent(guide.author.slug)}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <IconMessage className="size-4" />
            Poser une question
          </Link>
        </div>
      </div>
    </article>
  );
}
