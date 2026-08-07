import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CheckoutPanel } from "@/components/compte/checkout-panel";
import { fetchCheckout, fetchCurrentClient } from "@/lib/api/citizen";
import { fetchGuide } from "@/lib/api/public";
import { campayConfigured } from "@/lib/paiement/campay";
import { formatFcfa } from "@/lib/utils";
import {
  IconChevronLeft,
  IconDownload,
  IconFileText,
  IconLock,
  IconShieldCheck,
} from "@/components/ui/icons";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paiement",
  // Une page de paiement n'a rien à faire dans un index de moteur.
  robots: { index: false, follow: false },
};

/**
 * Page de paiement d'un guide.
 *
 * Elle sépare volontairement l'acte d'acheter de l'acte de lire : le paywall de
 * la page de lecture y conduit, plutôt que d'encaisser sur place. Trois raisons
 * à cela — le récapitulatif doit tenir sur un écran sans le texte du guide
 * autour ; l'URL doit être atteignable après une création de compte ; et le
 * branchement d'un opérateur suppose un aller-retour vers son écran, donc un
 * endroit où revenir.
 *
 * Le visiteur non connecté n'y voit pas un formulaire grisé : un achat doit se
 * rattacher à une bibliothèque, sans quoi il serait perdu au prochain
 * navigateur.
 */
export default async function AcheterGuidePage({ params }: Params) {
  const { slug } = await params;

  const [session, guide] = await Promise.all([fetchCurrentClient(), fetchGuide(slug)]);

  if (!guide) notFound();

  const order = session ? await fetchCheckout(slug) : null;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <div className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-4">
            <Link
              href={`/guides/${guide.slug}`}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-marine-600 transition-colors hover:text-gold-700"
            >
              <IconChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Retour au guide
            </Link>
          </div>
        </div>

        <div className="container-page py-8 lg:py-10">
          <div className="mx-auto grid max-w-4xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            {/* ---------------- Paiement ---------------- */}
            <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
              <h1 className="font-serif text-2xl/tight font-bold text-marine-950">
                {guide.free ? "Ajouter ce guide" : "Régler votre guide"}
              </h1>
              <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">
                {guide.free
                  ? "Ce document est en lecture libre. L’ajouter à votre bibliothèque vous en garde l’accès."
                  : "Un paiement unique, et le guide reste dans votre bibliothèque — même s’il est retiré du catalogue plus tard."}
              </p>

              <div className="mt-7 border-t border-marine-950/8 pt-7">
                {order ? (
                  // Seul un booléen traverse la frontière serveur/client : les
                  // clés CamPay restent dans le processus Next, le navigateur
                  // apprend juste s'il doit demander un numéro de téléphone.
                  <CheckoutPanel order={order} campayReady={campayConfigured()} />
                ) : (
                  <SignedOutNotice slug={guide.slug} price={guide.price} free={guide.free} />
                )}
              </div>
            </section>

            {/* ---------------- Récapitulatif ---------------- */}
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-400 uppercase">
                  Votre commande
                </p>

                <div className="mt-4 flex items-start gap-2">
                  <Badge tone={guide.free ? "free" : "premium"}>
                    {guide.kind === "modele" ? "Modèle" : "Guide"}
                  </Badge>
                </div>

                <h2 className="mt-3 font-serif text-lg/snug font-bold text-balance text-marine-950">
                  {guide.title}
                </h2>

                <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-marine-500">
                  {guide.pages > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <IconFileText className="size-3.5" />
                      {guide.pages} pages
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <IconDownload className="size-3.5" />
                    {guide.downloads} téléchargements
                  </span>
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-marine-950/6 pt-5">
                  <Avatar
                    initials={guide.author.initials}
                    imageUrl={guide.author.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-marine-950">
                      <Link
                        href={`/avocats/${guide.author.slug}`}
                        className="hover:text-gold-700"
                      >
                        {guide.author.name}
                      </Link>
                    </p>
                    <p className="truncate text-xs text-marine-500">{guide.author.city}</p>
                  </div>
                </div>

                <p className="mt-5 flex items-baseline justify-between gap-4 border-t border-marine-950/6 pt-5">
                  <span className="text-sm text-marine-600">Montant</span>
                  <span className="font-serif text-xl font-bold text-marine-950">
                    {guide.free ? "Gratuit" : formatFcfa(guide.price)}
                  </span>
                </p>
              </div>

              <p className="flex items-start gap-2.5 rounded-2xl bg-white p-5 text-xs/relaxed text-marine-600 shadow-card ring-1 ring-marine-950/6">
                <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
                Aucune donnée bancaire n’est conservée sur nos serveurs. Le
                document reste accessible depuis votre espace, sans nouvelle
                dépense.
              </p>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function SignedOutNotice({
  slug,
  price,
  free,
}: {
  slug: string;
  price: number;
  free: boolean;
}) {
  const suite = `/guides/${slug}/acheter`;

  return (
    <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-10 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconLock className="size-5" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">
        Un compte est nécessaire
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm/relaxed text-marine-600">
        {free
          ? "Votre bibliothèque garde ce document accessible, même s’il est retiré du catalogue."
          : `Sans compte, ${formatFcfa(price)} versés seraient perdus au prochain navigateur : c'est la bibliothèque qui porte l'accès permanent.`}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={`/compte/inscription?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ size: "md" })}
        >
          Créer mon compte
        </Link>
        <Link
          href={`/compte/connexion?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          J’ai déjà un compte
        </Link>
      </div>

      <p className="mt-5 text-xs text-marine-500">Gratuit, et une minute suffit.</p>
    </div>
  );
}
