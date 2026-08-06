import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { ThreadView } from "@/components/messages/thread-view";
import { findThread, viewerFromParam, viewerToParam } from "@/lib/api/desk";
import { IconChevronLeft, IconEye, IconShieldCheck } from "@/components/ui/icons";

type Params = {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false, follow: false },
};

/**
 * Un fil de discussion, vu depuis l'un ou l'autre versant.
 *
 * Le lien d'une notification ne porte que l'identifiant du fil : `findThread`
 * essaie les deux sessions ouvertes, en commençant par celle que l'URL suggère.
 * Un praticien qui clique la notification reçue sur son téléphone ouvre donc le
 * bon fil même si son navigateur porte aussi un cookie citoyen.
 */
export default async function ConversationPage({ params, searchParams }: Params) {
  const [{ uuid }, query] = await Promise.all([params, searchParams]);

  const found = await findThread(uuid, viewerFromParam(single(query.profil)));

  if (!found) notFound();

  const { viewer, thread } = found;
  const { conversation, messages } = thread;
  const peer = conversation.with;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <div className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-4">
            <Link
              href={`/messages?profil=${viewerToParam(viewer)}`}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-marine-600 transition-colors hover:text-gold-700"
            >
              <IconChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Tous mes messages
            </Link>
          </div>
        </div>

        <div className="container-page py-8 lg:py-10">
          <div className="mx-auto max-w-3xl">
            <header className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-marine-950/6 sm:p-6">
              <Avatar initials={peer.initials || "?"} />

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-serif text-xl font-bold text-marine-950">
                  {peer.name || "Correspondant"}
                </h1>
                <p className="truncate text-sm text-marine-500">
                  {conversation.subject || "Conversation"}
                  {peer.city && ` · ${peer.city}`}
                </p>
              </div>

              {/* Un citoyen peut ouvrir la vitrine de son interlocuteur ; le
                  praticien, lui, ne voit qu'un pseudonyme — l'identité réelle
                  du citoyen ne sort pas de sa table tant qu'il ne la donne
                  pas lui-même dans le fil. */}
              {peer.type === "account" && peer.slug && (
                <Link
                  href={`/avocats/${peer.slug}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  <IconEye className="size-4" />
                  Voir la fiche
                </Link>
              )}
            </header>

            <section className="mt-5 rounded-3xl bg-white p-5 shadow-card ring-1 ring-marine-950/6 sm:p-7">
              <ThreadView
                uuid={conversation.id}
                viewer={viewer}
                initial={messages}
                peerName={peer.name || "votre correspondant"}
              />
            </section>

            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-white p-5 text-xs/relaxed text-marine-600 shadow-card ring-1 ring-marine-950/6">
              <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
              Cet échange est privé. N’y faites figurer aucune donnée bancaire :
              les honoraires se règlent par les moyens de paiement de la
              plateforme, jamais par message.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/** Un paramètre d'URL répété ne doit pas casser la page. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
