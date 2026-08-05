import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { buttonStyles } from "@/components/ui/button";
import {
  IconAlert,
  IconArrowRight,
  IconBriefcase,
  IconIncognito,
  IconMail,
  IconScale,
  IconShieldCheck,
  IconWhatsapp,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Support, signalement d’un contenu, exercice de vos droits sur vos données, ou question sur l’inscription des avocats.",
  alternates: { canonical: "/contact" },
};

/**
 * Page de contact.
 *
 * Volontairement sans formulaire générique. Un formulaire unique dirige tout
 * vers la même boîte, où les demandes urgentes se noient parmi les questions
 * commerciales. Orienter d'abord vers le bon canal coûte un clic au visiteur et
 * fait gagner des jours de traitement.
 *
 * Le point le plus important de cette page est ce qu'elle refuse : elle ne
 * prend pas de question juridique. Répondre à « mon employeur m'a licencié, que
 * faire ? » depuis un support de plateforme reviendrait à donner une
 * consultation sans en avoir le droit.
 */
const CHANNELS = [
  {
    id: "juridique",
    Icon: IconScale,
    title: "J’ai une question juridique",
    body: "Le support ne peut pas y répondre — seul un avocat le peut. Déposez votre besoin : il est acheminé gratuitement et sous pseudonyme vers les praticiens compétents.",
    action: { label: "Déposer mon besoin", href: "/besoin/nouveau" },
    tone: "gold" as const,
  },
  {
    id: "avocat",
    Icon: IconBriefcase,
    title: "Je suis avocat et je veux m’inscrire",
    body: "L’inscription est en ligne et gratuite. Prévoyez votre attestation d’inscription au Barreau, votre carte professionnelle et une pièce d’identité.",
    action: { label: "Rejoindre le réseau", href: "/avocats/inscription" },
    tone: "marine" as const,
  },
  {
    id: "signalement",
    Icon: IconAlert,
    title: "Je signale un contenu ou un comportement",
    body: "Avis diffamatoire, fiche trompeuse, manquement à la charte : décrivez les faits et joignez l’adresse de la page concernée. Le compte visé peut être suspendu pendant l’examen.",
    action: { label: "Écrire au signalement", href: "mailto:signalement@takealawyer.cm" },
    tone: "marine" as const,
  },
  {
    id: "donnees",
    Icon: IconIncognito,
    title: "Je veux accéder à mes données ou les supprimer",
    body: "Accès, rectification, export, suppression : nous répondons sous trente jours. Précisez l’adresse e-mail du compte concerné.",
    action: { label: "Écrire au délégué", href: "mailto:donnees@takealawyer.cm" },
    tone: "marine" as const,
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          {/* Une conversation autour d'une table : la page qui parle de prise
              de contact est la seule des cinq à montrer des personnes. */}
          <PageHeaderBackdrop image="/headers/comment-ca-marche.webp" position="center 40%" />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Nous contacter
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight">
              Dites-nous ce qui vous amène
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              Chaque demande a son canal. Choisir le bon fait gagner plusieurs
              jours — et évite qu’une urgence se retrouve derrière trente
              questions commerciales.
            </p>
          </div>
        </header>

        <div className="container-page py-12 lg:py-16">
          <ul className="grid gap-5 lg:grid-cols-2">
            {CHANNELS.map((channel) => (
              <li
                key={channel.id}
                className={
                  channel.tone === "gold"
                    ? "flex flex-col rounded-3xl border border-gold-500/30 bg-gold-50 p-7"
                    : "flex flex-col rounded-3xl bg-white p-7 ring-1 ring-marine-950/6"
                }
              >
                <span
                  className={
                    channel.tone === "gold"
                      ? "grid size-12 place-items-center rounded-2xl bg-white text-gold-700"
                      : "grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-700"
                  }
                >
                  <channel.Icon className="size-5.5" />
                </span>

                <h2 className="mt-5 font-serif text-xl/snug font-bold text-marine-950">
                  {channel.title}
                </h2>
                <p className="mt-3 flex-1 text-[0.95rem]/relaxed text-marine-600">
                  {channel.body}
                </p>

                <div className="mt-6">
                  {channel.action.href.startsWith("mailto:") ? (
                    <a
                      href={channel.action.href}
                      className={buttonStyles({
                        variant: channel.tone === "gold" ? "gold" : "outline",
                        size: "sm",
                      })}
                    >
                      <IconMail className="size-4" />
                      {channel.action.label}
                    </a>
                  ) : (
                    <Link
                      href={channel.action.href}
                      className={buttonStyles({
                        variant: channel.tone === "gold" ? "gold" : "outline",
                        size: "sm",
                      })}
                    >
                      {channel.action.label}
                      <IconArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-marine-950/6">
              <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                Support général
              </p>
              <a
                href="mailto:contact@takealawyer.cm"
                className="mt-3 inline-flex items-center gap-2 font-medium text-marine-800 hover:text-gold-700"
              >
                <IconMail className="size-4 text-gold-500" />
                contact@takealawyer.cm
              </a>
              <p className="mt-2 text-sm text-marine-500">
                Réponse sous 48 heures ouvrées.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-marine-950/6">
              <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                WhatsApp
              </p>
              <a
                href="https://wa.me/237600000000"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 font-medium text-marine-800 hover:text-gold-700"
              >
                <IconWhatsapp className="size-4 text-trust-500" />
                +237 6 00 00 00 00
              </a>
              <p className="mt-2 text-sm text-marine-500">
                Du lundi au vendredi, 8 h – 18 h.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-marine-950/6">
              <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                Confidentialité
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm/relaxed text-marine-600">
                <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
                N’envoyez jamais de pièce de dossier par e-mail ou WhatsApp. Ces
                canaux ne sont pas chiffrés et ne relèvent pas du secret
                professionnel.
              </p>
            </div>
          </div>

          <p className="mt-10 text-sm/relaxed text-marine-500">
            Les coordonnées postales de la société éditrice figurent dans les{" "}
            <Link href="/mentions-legales" className="font-medium text-marine-700 hover:text-gold-700">
              mentions légales
            </Link>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
