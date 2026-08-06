import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { plans } from "@/lib/avocats/signup";
import { cn } from "@/lib/utils";
import {
  IconArrowRight,
  IconCheck,
  IconCrown,
  IconShieldCheck,
  IconSparkles,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Formules et tarifs pour les avocats",
  description:
    "Les trois formules d’inscription au réseau TakeALawyer : Essentiel gratuit, Premium, et l’offre Pionnière réservée aux 500 premiers inscrits.",
  alternates: { canonical: "/tarifs" },
};

/**
 * Grille tarifaire des praticiens.
 *
 * Les formules viennent de `lib/avocats/signup` — la même source que l'étape du
 * wizard d'inscription. Les recopier ici les aurait fait diverger au premier
 * ajustement de prix, et un tarif annoncé sur la page publique qui ne
 * correspond pas à celui du formulaire est une promesse rompue.
 */
export default function TarifsPage() {
  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          <PageHeaderBackdrop image="/headers/avocats.webp" position="center 45%" veil={0.18} />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Espace Avocat
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
              Trois formules, aucun engagement de durée
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              L’inscription et la vérification sont gratuites. Vous ne payez que
              la visibilité et les outils de vente — jamais le droit d’exister
              dans l’annuaire.
            </p>
          </div>
        </header>

        {/* Voir `app/avocats/page.tsx` : sans `relative`, l'en-tête positionné
            ci-dessus recouvre la partie chevauchante des cartes. */}
        <div className="relative z-10 container-page -mt-8">
          <ul className="grid items-start gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.id}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-3xl p-6 shadow-card sm:p-7",
                    plan.featured
                      ? "bg-marine-950 text-white ring-1 ring-gold-500/40"
                      : "bg-white ring-1 ring-marine-950/6",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2
                      className={cn(
                        "font-serif text-xl font-bold",
                        plan.featured ? "text-white" : "text-marine-950",
                      )}
                    >
                      {plan.name}
                    </h2>

                    {plan.featured && (
                      <Badge tone="premium" className="bg-gold-500/20">
                        <IconSparkles className="size-3.5" />
                        Le plus choisi
                      </Badge>
                    )}

                    {plan.id === "pionnier" && (
                      <Badge tone="pioneer">
                        <IconCrown className="size-3.5" />
                        Lancement
                      </Badge>
                    )}
                  </div>

                  <p
                    className={cn(
                      "mt-1.5 text-sm/relaxed",
                      plan.featured ? "text-marine-200" : "text-marine-600",
                    )}
                  >
                    {plan.pitch}
                  </p>

                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-serif text-3xl font-bold",
                        plan.featured ? "text-white" : "text-marine-950",
                      )}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={cn(
                          "text-sm",
                          plan.featured ? "text-marine-300" : "text-marine-500",
                        )}
                      >
                        {plan.period}
                      </span>
                    )}
                  </p>

                  <ul
                    className={cn(
                      "mt-6 flex-1 space-y-3 border-t pt-6",
                      plan.featured ? "border-white/12" : "border-marine-950/6",
                    )}
                  >
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <IconCheck
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            plan.featured ? "text-gold-400" : "text-trust-600",
                          )}
                          strokeWidth={3}
                        />
                        <span
                          className={cn(
                            "text-sm/relaxed",
                            plan.featured ? "text-marine-100" : "text-marine-700",
                          )}
                        >
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/avocats/inscription?formule=${plan.id}`}
                    className={buttonStyles({
                      variant: plan.featured ? "gold" : "outline",
                      size: "sm",
                      full: true,
                      className: cn("mt-7", !plan.featured && "border-marine-950/15"),
                    })}
                  >
                    Choisir {plan.name}
                    <IconArrowRight className="size-4" />
                  </Link>
                </article>
              </li>
            ))}
          </ul>

          {/* L'ancre est référencée depuis le pied de page et l'en-tête : elle
              doit exister, et pointer sur une explication réelle. */}
          <section
            id="credits"
            className="mt-6 scroll-mt-28 rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8"
          >
            <h2 className="font-serif text-xl font-bold text-marine-950">
              Crédits de réponse
            </h2>
            <p className="mt-3 max-w-3xl text-[0.95rem]/relaxed text-marine-600">
              Un crédit est consommé chaque fois que vous répondez à un problème
              déposé dans l’espace communautaire ou adressé à votre cabinet. La
              formule Essentiel en accorde cinq par mois ; Premium et Pionnier
              n’en consomment pas. Les crédits non utilisés ne se reportent pas
              d’un mois sur l’autre : ils mesurent une disponibilité, pas un
              stock.
            </p>

            <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
              <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
              Répondre dans l’espace communautaire n’est jamais facturé au
              citoyen. C’est l’avocat qui paie sa visibilité, jamais la personne
              qui cherche de l’aide.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/avocats/inscription" className={buttonStyles({ size: "sm" })}>
                Rejoindre le réseau
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                href="/communaute"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Voir l’espace communautaire
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
