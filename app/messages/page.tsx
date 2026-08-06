import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { ViewerTabs } from "@/components/messages/viewer-tabs";
import {
  fetchConversations,
  openViewers,
  resolveViewer,
  viewerFromParam,
  viewerToParam,
} from "@/lib/api/desk";
import { IconArrowRight, IconMessages, IconSend } from "@/components/ui/icons";

/** Les fils changent à chaque message reçu. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes messages",
  // Une boîte de réception n'a rien à faire dans un index de moteur.
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Messagerie — une seule page pour les deux versants.
 *
 * Citoyen et praticien voient exactement le même écran : une liste de fils, et
 * l'interlocuteur de chacun. Ce qui change, c'est l'endpoint interrogé, et
 * `lib/api/desk` s'en charge. Deux pages jumelles auraient divergé au premier
 * ajustement.
 */
export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const [viewers, viewer] = await Promise.all([
    openViewers(),
    resolveViewer(viewerFromParam(single(params.profil))),
  ]);

  if (viewer === null) return <SignedOut />;

  const { items } = await fetchConversations(viewer);

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="min-h-[60vh] bg-panel pb-24 lg:pb-16">
        <div className="container-page py-8 lg:py-10">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-marine-950 sm:text-3xl">
                Mes messages
              </h1>
              <p className="mt-2 text-[0.95rem]/relaxed text-marine-600">
                {viewer === "account"
                  ? "Les échanges engagés par les citoyens qui vous ont écrit."
                  : "Vos échanges privés avec les cabinets que vous avez contactés."}
              </p>
            </div>

            <Link
              href={viewer === "account" ? "/avocats/espace-praticien" : "/compte"}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Mon espace
              <IconArrowRight className="size-4" />
            </Link>
          </header>

          {/* Les deux sessions peuvent être ouvertes en même temps : l'onglet
              n'apparaît que dans ce cas, sinon il ne proposerait qu'un choix. */}
          {viewers.length > 1 && (
            <ViewerTabs current={viewer} base="/messages" className="mt-6" />
          )}

          {items.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {items.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/messages/${conversation.id}?profil=${viewerToParam(viewer)}`}
                    className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-marine-950/6 transition-colors hover:ring-gold-500/30 sm:p-5"
                  >
                    <Avatar initials={conversation.with.initials || "?"} size="sm" />

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="truncate font-semibold text-marine-950">
                          {conversation.with.name || "Correspondant"}
                        </span>
                        <span className="text-xs text-marine-500">{conversation.date}</span>
                      </span>

                      {conversation.subject && (
                        <span className="mt-0.5 block truncate text-sm font-medium text-marine-700">
                          {conversation.subject}
                        </span>
                      )}

                      <span className="mt-1 block truncate text-sm text-marine-500">
                        {conversation.excerpt || "Aucun message pour l’instant."}
                      </span>
                    </span>

                    {conversation.unread > 0 && (
                      <span
                        className="mt-1 shrink-0 rounded-full bg-gold-500 px-2 py-0.5 text-[0.7rem] font-bold text-marine-950"
                        aria-label={`${conversation.unread} message${conversation.unread > 1 ? "s" : ""} non lu${conversation.unread > 1 ? "s" : ""}`}
                      >
                        {conversation.unread}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyInbox viewer={viewer} />
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function EmptyInbox({ viewer }: { viewer: "client" | "account" }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-marine-300 bg-white px-6 py-16 text-center">
      <span
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconMessages className="size-6" />
      </span>

      <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
        Aucune conversation pour l’instant
      </h2>

      <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
        {viewer === "account"
          ? "Les fils s’ouvrent quand un citoyen vous adresse une question ou réserve une prestation. Une vitrine complète en reçoit davantage."
          : "Un fil s’ouvre dès que vous adressez une question à un cabinet ou réservez une prestation."}
      </p>

      <Link
        href={viewer === "account" ? "/avocats/espace-praticien" : "/besoin/nouveau"}
        className={buttonStyles({ size: "sm", className: "mt-7" })}
      >
        {viewer === "account" ? (
          "Compléter ma vitrine"
        ) : (
          <>
            <IconSend className="size-4" />
            Poser mon problème
          </>
        )}
      </Link>
    </div>
  );
}

async function SignedOut() {
  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="min-h-[60vh] bg-panel py-16">
        <div className="container-page max-w-lg text-center">
          <span
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-marine-400 shadow-card"
            aria-hidden="true"
          >
            <IconMessages className="size-6" />
          </span>

          <h1 className="mt-5 font-serif text-2xl font-bold text-marine-950">
            Connectez-vous pour voir vos messages
          </h1>
          <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">
            Vos échanges avec les cabinets sont privés : ils ne s’ouvrent qu’avec
            votre session.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/compte/connexion?suite=%2Fmessages"
              className={buttonStyles({ size: "md" })}
            >
              Espace citoyen
            </Link>
            <Link
              href="/avocats/connexion"
              className={buttonStyles({ variant: "outline", size: "md" })}
            >
              Espace praticien
            </Link>
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
