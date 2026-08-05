"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import type { GuideSummary } from "@/lib/api/public";
import { cn, formatFcfa, groupDigits } from "@/lib/utils";
import {
  IconBadgeCheck,
  IconCheck,
  IconChevronRight,
  IconSmartphone,
  IconSparkles,
} from "@/components/ui/icons";

const ROTATION_MS = 6000;

/**
 * Mini-diaporama « Guide en vedette », posé dans la colonne visuelle du hero.
 *
 * Il fait le pont entre l'écran 1 et la bibliothèque : dès l'arrivée, on voit
 * qu'un guide complet coûte 250 FCFA. Une seule carte à la fois — la hauteur
 * est verrouillée par des `line-clamp` pour que le défilement automatique ne
 * fasse pas sauter la mise en page.
 */
export function FeaturedGuideSlide({ guides }: { guides: GuideSummary[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = guides.length;

  useEffect(() => {
    // Le défilement automatique est une animation : on le coupe si le système
    // demande de réduire les animations.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused || total < 2) return;

    const id = setInterval(() => setIndex((i) => (i + 1) % total), ROTATION_MS);

    return () => clearInterval(id);
  }, [paused, total]);

  // Bibliothèque vide ou backend injoignable : la colonne visuelle disparaît
  // plutôt que d'annoncer un guide inexistant.
  if (total === 0) return null;

  const guide = guides[index % total];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="animate-fade-up rounded-3xl border border-white/70 bg-white/55 p-2 shadow-card backdrop-blur-md"
      >
        <div className="rounded-[1.15rem] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-gold-700 uppercase ring-1 ring-gold-500/25 ring-inset">
              <IconSparkles className="size-3.5" />
              Guide en vedette
            </span>
            <span className="shrink-0 rounded-full bg-gold-500 px-3 py-1 font-serif text-sm font-bold text-marine-950">
              {guide.free ? "Gratuit" : formatFcfa(guide.price)}
            </span>
          </div>

          {/* `key` relance le fondu à chaque changement de guide. */}
          <div key={guide.slug} className="animate-fade-in">
            <p className="mt-5 text-[0.7rem] font-bold tracking-[0.14em] text-marine-400 uppercase">
              {guide.category}
            </p>

            <h2 className="mt-2 line-clamp-2 min-h-[3.5rem] font-serif text-xl/snug font-bold text-marine-950">
              {guide.title}
            </h2>

            <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm/relaxed text-marine-600">
              {guide.description}
            </p>

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm/snug text-marine-800">
              <IconCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
              <span className="line-clamp-2 min-h-[2.5rem]">
                {guide.free
                  ? "Lecture libre, intégralement accessible"
                  : `Environ 30 % du guide est lisible avant tout paiement`}
              </span>
            </p>

            <div className="mt-4 flex items-center gap-2.5 border-t border-marine-950/6 pt-4">
              <Avatar
                initials={guide.author.initials}
                imageUrl={guide.author.avatarUrl}
                size="sm"
              />
              <span className="min-w-0 text-sm/tight">
                <span className="flex items-center gap-1 font-semibold text-marine-900">
                  <span className="truncate">{guide.author.name}</span>
                  <IconBadgeCheck className="size-3.5 shrink-0 text-gold-500" />
                </span>
                <span className="text-marine-500">
                  {guide.readingTime} min · {groupDigits(guide.downloads)} lectures
                </span>
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href={`/guides/${guide.slug}`}
              className={buttonStyles({
                size: "sm",
                full: true,
                className: "sm:flex-1",
              })}
            >
              <IconSmartphone className="size-4" />
              {guide.free
                ? "Lire gratuitement"
                : `Débloquer · ${formatFcfa(guide.price, { short: true })}`}
            </Link>
            <Link
              href="/guides"
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                full: true,
                className: "border-marine-950/12 sm:flex-1",
              })}
            >
              Toute la bibliothèque
            </Link>
          </div>

          {/* Pagination du diaporama */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-marine-950/6 pt-4">
            <div className="flex items-center gap-2">
              {guides.map((item, i) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Voir le guide : ${item.title}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-gold-500"
                      : "w-1.5 bg-marine-950/15 hover:bg-marine-950/30",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % total)}
              aria-label="Guide suivant"
              className="grid size-8 place-items-center rounded-full text-marine-500 transition-colors hover:bg-marine-50 hover:text-marine-900"
            >
              <IconChevronRight className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Une seule pastille flottante, en blanc : elle rappelle le moyen de
          paiement sans alourdir la composition. */}
      <div className="animate-fade-up absolute -bottom-5 left-4 inline-flex items-center gap-2 rounded-2xl border border-marine-950/8 bg-white px-3.5 py-2.5 shadow-card sm:-left-6 [animation-delay:320ms]">
        <IconSmartphone className="size-4.5 text-gold-600" />
        <span className="text-sm font-semibold text-marine-900">
          Paiement Mobile Money
        </span>
      </div>
    </div>
  );
}
