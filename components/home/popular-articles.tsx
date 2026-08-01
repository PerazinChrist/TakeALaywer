import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { popularArticles, type Article } from "@/lib/data/home";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconClock,
  IconCrown,
  IconLock,
  IconMessage,
  IconTrendingUp,
} from "@/components/ui/icons";

/**
 * Section « Articles & Guides Populaires » — module 3.
 * Met en scène le paywall « teaser » (directive-ui.md § 4) et la carte auteur
 * flottante (directive-ui.md § 2).
 */
export function PopularArticles() {
  const featured = popularArticles.find((a) => a.access === "premium") ?? popularArticles[0];
  const others = popularArticles.filter((a) => a.slug !== featured.slug);

  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="guides-titre">
      <div className="container-page">
        <SectionHeading
          eyebrow="Articles & guides populaires"
          title={<span id="guides-titre">Résolvez seul, ou venez préparé</span>}
          description="Des guides rédigés et signés par des avocats vérifiés. Certains sont gratuits, d’autres incluent des modèles de documents prêts à l’emploi."
          action={
            <Link
              href="/guides"
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Tous les guides
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <FeaturedArticle article={featured} />

          <div className="flex flex-col gap-4 lg:col-span-5">
            {others.map((article) => (
              <CompactArticle key={article.slug} article={article} />
            ))}

            <Link
              href="/guides"
              className="group flex items-center justify-between rounded-2xl border border-dashed border-marine-300 px-5 py-4 text-sm font-semibold text-marine-700 transition-colors hover:border-gold-500 hover:bg-gold-50 hover:text-gold-700"
            >
              128 autres guides publiés par 340 avocats auteurs
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function FeaturedArticle({ article }: { article: Article }) {
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
            Article premium
          </Badge>
          <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-marine-600 uppercase ring-1 ring-marine-950/6 ring-inset">
            {article.category}
          </span>
        </div>

        <h3 className="mt-5 font-serif text-2xl/snug font-bold text-marine-950 sm:text-3xl/snug">
          <Link href={`/guides/${article.slug}`} className="hover:text-gold-700">
            {article.title}
          </Link>
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-marine-600">
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="size-4 text-gold-600" />
            {article.readingTime} min de lecture
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconTrendingUp className="size-4 text-trust-600" />
            {article.views} lectures
          </span>
        </div>

        {/* Les 30 % lisibles, puis l'effet dégradé — directive-ui.md § 4 */}
        <div className="relative mt-6">
          <p className="text-[0.95rem]/relaxed text-marine-700">{article.excerpt}</p>

          <div className="mt-3" aria-hidden="true">
            <p className="paywall-blur text-[0.95rem]/relaxed text-marine-700">
              La première étape consiste à qualifier juridiquement la rupture.
              Le code du travail distingue trois situations que les employeurs
              confondent presque toujours, et cette confusion joue en votre
              faveur devant l’inspecteur du travail à condition de la relever
              dans le délai imparti.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-panel to-transparent" />
          </div>
        </div>

        {/* Aperçu des pépites masquées */}
        <div className="mt-5 rounded-2xl border border-gold-500/25 bg-gold-50 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-gold-800">
            <IconLock className="size-4" />
            Ce que vous allez débloquer
          </p>
          <ul className="mt-3 space-y-2">
            {article.unlocks?.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-marine-800">
                <IconCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href={`/guides/${article.slug}`} className={buttonStyles()}>
            Débloquer pour {article.price}
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-xs/relaxed text-marine-500">
            Paiement Mobile Money ou carte bancaire.
            <br className="hidden sm:block" />
            Inclus gratuitement dans l’abonnement Premium.
          </p>
        </div>
      </div>

      {/* Carte auteur — directive-ui.md § 2 */}
      <div className="relative border-t border-marine-950/8 bg-white p-5 sm:px-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar initials={article.author.initials} />
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-marine-950">
                {article.author.name}
                {article.author.verified && (
                  <IconBadgeCheck className="size-4 text-gold-500" />
                )}
              </p>
              <p className="text-sm text-marine-600">{article.author.role}</p>
            </div>
          </div>

          <Link
            href={`/besoin/nouveau?avocat=${article.author.initials}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <IconMessage className="size-4" />
            Poser une question à cet avocat
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

function CompactArticle({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-marine-950/8 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-marine-300 hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.7rem] font-bold tracking-[0.14em] text-marine-400 uppercase">
          {article.category}
        </span>
        {article.access === "free" ? (
          <Badge tone="free">Gratuit</Badge>
        ) : (
          <Badge tone="premium">
            <IconCrown className="size-3.5" />
            {article.price}
          </Badge>
        )}
      </div>

      <h3 className="mt-3 font-serif text-lg/snug font-bold text-marine-950">
        <Link href={`/guides/${article.slug}`} className="group-hover:text-gold-700">
          {article.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-sm/relaxed text-marine-600">
        {article.excerpt}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-marine-950/6 pt-3.5">
        <div className="flex items-center gap-2">
          <Avatar initials={article.author.initials} size="sm" />
          <span className="text-sm/tight">
            <span className="flex items-center gap-1 font-semibold text-marine-900">
              {article.author.name}
              {article.author.verified && (
                <IconBadgeCheck className="size-3.5 text-gold-500" />
              )}
            </span>
            <span className="text-marine-500">{article.readingTime} min de lecture</span>
          </span>
        </div>
        <IconArrowRight className="size-4 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
      </div>
    </article>
  );
}
