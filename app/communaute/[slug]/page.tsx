import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { HelpfulButton } from "@/components/communaute/helpful-button";
import { ReplyForm } from "@/components/communaute/reply-form";
import { fetchNeed } from "@/lib/api/community";
import { openViewers } from "@/lib/api/desk";
import type { NeedReply } from "@/lib/api/types";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconChevronLeft,
  IconEye,
  IconMapPin,
  IconMessage,
  IconSend,
  IconShieldCheck,
} from "@/components/ui/icons";

type Params = { params: Promise<{ slug: string }> };

/** Vues et réponses changent en continu : rien à figer. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchNeed(slug);

  if (!detail) return { title: "Problème introuvable" };

  return {
    title: detail.need.title,
    description: detail.need.excerpt,
    alternates: { canonical: `/communaute/${detail.need.slug}` },
  };
}

export default async function NeedPage({ params }: Params) {
  const { slug } = await params;

  const [detail, viewers] = await Promise.all([fetchNeed(slug), openViewers()]);

  if (!detail) notFound();

  const { need, replies, voted } = detail;

  // Un avocat connecté répond en tant qu'avocat, même s'il possède aussi un
  // compte citoyen : c'est le badge qui fait la valeur de sa réponse ici.
  const role = viewers.includes("account")
    ? "account"
    : viewers.includes("client")
      ? "client"
      : null;

  const lawyerReplies = replies.filter((reply) => reply.lawyer !== null).length;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <div className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-4">
            <Link
              href="/communaute"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-marine-600 transition-colors hover:text-gold-700"
            >
              <IconChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Tous les problèmes
            </Link>
          </div>
        </div>

        <div className="container-page py-8 lg:py-10">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
            <div className="space-y-5">
              {/* ---------------- Le problème ---------------- */}
              <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  {need.specialty && <Badge tone="neutral">{need.specialty}</Badge>}
                  {need.status === "resolu" && <Badge tone="free">Résolu</Badge>}
                  {need.budget && <Badge tone="premium">Budget : {need.budget}</Badge>}
                </div>

                <h1 className="mt-4 font-serif text-2xl/tight font-bold text-balance text-marine-950 sm:text-3xl/tight">
                  {need.title}
                </h1>

                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marine-500">
                  <span className="font-semibold text-marine-800">{need.author}</span>
                  <span>{need.date}</span>
                  {need.city && (
                    <span className="inline-flex items-center gap-1">
                      <IconMapPin className="size-3.5" />
                      {need.city}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <IconEye className="size-3.5" />
                    {need.views} {need.views > 1 ? "vues" : "vue"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconMessage className="size-3.5" />
                    {need.replies} {need.replies > 1 ? "réponses" : "réponse"}
                  </span>
                </p>

                {/* `whitespace-pre-line` : le texte a été saisi dans une zone de
                    texte, ses retours à la ligne font partie du récit. */}
                <div className="mt-6 border-t border-marine-950/6 pt-6">
                  <p className="text-[1rem]/relaxed whitespace-pre-line text-marine-800">
                    {need.body ?? need.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-marine-950/6 pt-5">
                  <HelpfulButton
                    target="besoin"
                    id={need.slug}
                    count={need.helpful}
                    voted={voted.includes(`need:${need.id}`) || voted.includes(need.slug)}
                  />

                  <p className="text-xs/relaxed text-marine-500">
                    Cliquez si votre situation ressemble à celle-ci : les
                    problèmes les plus signalés remontent dans la liste.
                  </p>
                </div>
              </article>

              {/* ---------------- Les réponses ---------------- */}
              <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
                <h2 className="font-serif text-xl font-bold text-marine-950">
                  {replies.length === 0
                    ? "Aucune réponse pour l’instant"
                    : `${replies.length} ${replies.length > 1 ? "réponses" : "réponse"}`}
                </h2>

                {lawyerReplies > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-trust-700">
                    <IconBadgeCheck className="size-4" />
                    Dont {lawyerReplies} {lawyerReplies > 1 ? "réponses d’avocats" : "réponse d’avocat"} vérifiés
                  </p>
                )}

                {replies.length > 0 ? (
                  <ul className="mt-6 space-y-4">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <ReplyItem reply={reply} voted={voted.includes(`reply:${reply.id}`)} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm/relaxed text-marine-600">
                    Personne n’a encore répondu. Si vous connaissez cette
                    situation, votre retour aidera l’auteur — et tous ceux qui
                    liront ce fil ensuite.
                  </p>
                )}
              </section>

              {/* ---------------- Répondre ---------------- */}
              <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
                <h2 className="mb-5 font-serif text-xl font-bold text-marine-950">
                  Apporter une réponse
                </h2>
                <ReplyForm slug={need.slug} role={role} />
              </section>
            </div>

            {/* ---------------- Colonne latérale ---------------- */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-marine-950 p-6 text-white">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-400 uppercase">
                  Votre situation est proche ?
                </p>
                <p className="mt-3 font-serif text-xl/snug font-bold">
                  Décrivez-la, elle sera lue
                </p>
                <p className="mt-2 text-sm/relaxed text-marine-200">
                  Publiquement, ou en privé à un cabinet de votre choix. Vous
                  êtes prévenu dès qu’on vous répond.
                </p>

                <Link
                  href={
                    need.specialty
                      ? `/besoin/nouveau?domaine=${encodeURIComponent(need.specialty)}`
                      : "/besoin/nouveau"
                  }
                  className={buttonStyles({ size: "sm", full: true, className: "mt-5" })}
                >
                  <IconSend className="size-4" />
                  Poser mon problème
                </Link>
              </div>

              {need.specialty && (
                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
                  <h2 className="font-serif text-lg font-bold text-marine-950">
                    Trouver un avocat
                  </h2>
                  <p className="mt-2 text-sm/relaxed text-marine-600">
                    Les praticiens de l’annuaire qui traitent ce domaine ont tous
                    été vérifiés avant publication.
                  </p>

                  <Link
                    href={`/avocats?domaine=${encodeURIComponent(need.specialty)}`}
                    className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800"
                  >
                    Avocats en {need.specialty.toLowerCase()}
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              <p className="flex items-start gap-2.5 rounded-2xl bg-white p-5 text-xs/relaxed text-marine-600 shadow-card ring-1 ring-marine-950/6">
                <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
                Les échanges publiés ici sont des repères, pas des consultations.
                Un dossier ne s’apprécie qu’au vu des pièces.
              </p>
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

/**
 * Une réponse du fil.
 *
 * Le badge « Avocat » n'est pas décoratif : il n'apparaît que lorsque le
 * backend a confirmé que la réponse vient d'un compte praticien **vérifié**.
 * Toute la mise en forme de la carte suit — encadré doré, lien vers la vitrine,
 * barreau d'inscription — parce que c'est cette réponse-là que le lecteur est
 * venu chercher.
 */
function ReplyItem({ reply, voted }: { reply: NeedReply; voted: boolean }) {
  const lawyer = reply.lawyer;

  return (
    <article
      className={
        lawyer
          ? "rounded-2xl border border-gold-500/35 bg-gold-50/50 p-5"
          : "rounded-2xl border border-marine-950/8 p-5"
      }
    >
      <div className="flex items-start gap-3">
        <Avatar initials={reply.initials} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {lawyer && lawyer.slug ? (
              <Link
                href={`/avocats/${lawyer.slug}`}
                className="font-semibold text-marine-950 hover:text-gold-700"
              >
                {lawyer.name}
              </Link>
            ) : (
              <span className="font-semibold text-marine-950">{reply.author}</span>
            )}

            {lawyer && (
              <Badge tone="verified">
                <IconBadgeCheck className="size-3.5" />
                {lawyer.type === "cabinet" ? "Cabinet" : "Avocat"}
              </Badge>
            )}
          </p>

          <p className="mt-0.5 text-xs text-marine-500">
            {[lawyer?.bar, lawyer?.city].filter(Boolean).join(" · ") || "Membre"} · {reply.date}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[0.95rem]/relaxed whitespace-pre-line text-marine-800">
        {reply.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <HelpfulButton target="reponse" id={reply.id} count={reply.helpful} voted={voted} compact />

        {lawyer && lawyer.slug && (
          <Link
            href={`/besoin/nouveau?avocat=${lawyer.slug}`}
            className="text-xs font-semibold text-gold-700 hover:text-gold-800"
          >
            Poser ma question en privé à ce cabinet
          </Link>
        )}
      </div>
    </article>
  );
}
