import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { buttonStyles } from "@/components/ui/button";
import { ViewerTabs } from "@/components/messages/viewer-tabs";
import { NotificationList } from "@/components/notifications/notification-list";
import {
  fetchNotifications,
  openViewers,
  resolveViewer,
  viewerFromParam,
} from "@/lib/api/desk";
import { IconArrowRight, IconBell } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes notifications",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Centre de notifications — une page, les deux versants.
 *
 * Chaque profil a sa propre file : un avocat ne reçoit pas les mêmes
 * événements qu'un citoyen, et les mélanger rendrait la liste illisible. Quand
 * les deux sessions sont ouvertes, l'onglet bascule de l'une à l'autre.
 */
export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const [viewers, viewer] = await Promise.all([
    openViewers(),
    resolveViewer(viewerFromParam(single(params.profil))),
  ]);

  if (viewer === null) return <SignedOut />;

  const { items } = await fetchNotifications(viewer);

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="min-h-[60vh] bg-panel pb-24 lg:pb-16">
        <div className="container-page py-8 lg:py-10">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-marine-950 sm:text-3xl">
                Mes notifications
              </h1>
              <p className="mt-2 text-[0.95rem]/relaxed text-marine-600">
                {viewer === "account"
                  ? "Messages reçus, demandes de rendez-vous, avis déposés sur votre vitrine."
                  : "Réponses à vos problèmes, suites données à vos demandes, messages des cabinets."}
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

          {viewers.length > 1 && (
            <ViewerTabs current={viewer} base="/notifications" className="mt-6" />
          )}

          <NotificationList initial={items} viewer={viewer} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/* -------------------------------------------------------------------------- */

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
            <IconBell className="size-6" />
          </span>

          <h1 className="mt-5 font-serif text-2xl font-bold text-marine-950">
            Connectez-vous pour voir vos notifications
          </h1>
          <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">
            Elles suivent votre compte : réponses reçues, rendez-vous confirmés,
            messages des cabinets.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/compte/connexion?suite=%2Fnotifications"
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
