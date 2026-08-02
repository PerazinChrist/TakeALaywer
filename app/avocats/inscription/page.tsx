import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { SignupWizard } from "@/components/avocats/inscription/signup-wizard";
import { fetchCurrentAccount } from "@/lib/api/account";
import {
  IconBadgeCheck,
  IconCrown,
  IconTrendingUp,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Rejoindre le réseau d’avocats",
  description:
    "Créez votre compte avocat ou cabinet : vérification de votre inscription au Barreau, vitrine publique et publication de guides.",
  alternates: { canonical: "/avocats/inscription" },
};

const arguments_ = [
  {
    icon: IconBadgeCheck,
    title: "Un badge qui vous distingue",
    text: "Carte professionnelle et inscription au Barreau contrôlées une à une.",
  },
  {
    icon: IconTrendingUp,
    title: "40 000 citoyens accompagnés",
    text: "Les besoins vous sont adressés selon votre spécialité et votre ville.",
  },
  {
    icon: IconCrown,
    title: "Offre Pionnière",
    text: "Inscription et profil vérifié offerts aux 500 premiers avocats.",
  },
];

export default async function InscriptionAvocatPage() {
  /*
   * Un praticien déjà connecté n'a rien à faire sur un formulaire de création
   * de compte : le lui présenter l'inviterait à s'inscrire une seconde fois,
   * et l'API refuserait de toute façon son adresse e-mail. On le renvoie vers
   * son espace.
   */
  if (await fetchCurrentAccount()) {
    redirect("/avocats/espace-praticien");
  }

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24">
        <section className="container-page pt-14 pb-10 lg:pt-20">
          <p className="rule-gold text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase">
            Espace Avocat
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl/tight font-bold text-balance text-marine-950 sm:text-4xl/tight lg:text-5xl/[1.08]">
            Rejoignez le réseau des avocats vérifiés
          </h1>
          <p className="mt-5 max-w-2xl text-lg/relaxed text-marine-950/70">
            Créez votre compte en six étapes. Que vous exerciez seul ou au sein
            d’un cabinet, les pièces demandées s’adaptent à votre situation.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {arguments_.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl bg-white/70 p-5 ring-1 ring-marine-950/6 backdrop-blur-sm"
              >
                <span
                  className="grid size-10 place-items-center rounded-xl bg-gold-500/12 text-gold-700"
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold text-marine-950">{title}</p>
                <p className="mt-1 text-sm/relaxed text-marine-600">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="container-page">
          <SignupWizard />
        </section>

        <p className="container-page mt-10 text-center text-sm text-marine-600">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/avocats/connexion"
            className="font-semibold text-gold-700 underline underline-offset-4"
          >
            Se connecter
          </Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
