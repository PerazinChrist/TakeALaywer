import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { CitizenSignupForm } from "@/components/compte/signup-form";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { IconClock, IconFileText, IconIncognito } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Créer mon compte",
  description:
    "Un e-mail, un mot de passe, et vos guides restent accessibles. Aucun justificatif, aucun frais d’inscription.",
  alternates: { canonical: "/compte/inscription" },
  robots: { index: false, follow: false },
};

const ESPACE = "/compte";

const points = [
  {
    icon: IconFileText,
    title: "Vos guides vous suivent",
    text: "Ce que vous débloquez reste dans votre bibliothèque, sur tous vos appareils.",
  },
  {
    icon: IconClock,
    title: "Une minute, trois champs",
    text: "Ni pièce d’identité, ni justificatif : c’est réservé aux avocats.",
  },
  {
    icon: IconIncognito,
    title: "Votre nom reste chez vous",
    text: "Les avocats ne voient qu’un pseudonyme, jamais votre identité réelle.",
  },
];

export default async function InscriptionCitoyenPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  /*
   * On vérifie la session auprès de WordPress plutôt que de se fier à la
   * présence du cookie : un cookie périmé redirigerait vers l'espace, qui
   * renverrait ici, et la boucle serait sans fin.
   */
  const session = await fetchCurrentClient();

  if (session) {
    redirect(ESPACE);
  }

  const { suite } = await searchParams;

  // Seules les destinations internes sont acceptées : un `suite` absolu
  // transformerait la page en tremplin vers un site tiers.
  const redirectTo = suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : ESPACE;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24">
        <section className="container-page grid gap-12 pt-14 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:pt-20">
          <div className="lg:pt-6">
            <p className="rule-gold text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase">
              Espace personnel
            </p>
            <h1 className="mt-5 text-3xl/tight font-bold text-balance text-marine-950 sm:text-4xl/tight">
              Gardez vos guides, suivez vos démarches
            </h1>
            <p className="mt-5 max-w-xl text-lg/relaxed text-marine-950/70">
              Un compte gratuit pour retrouver ce que vous avez lu, ce que vous
              avez débloqué et les avis que vous avez laissés.
            </p>

            <ul className="mt-8 space-y-5">
              {points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-700"
                    aria-hidden="true"
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-marine-900">{title}</span>
                    <span className="mt-0.5 block text-sm/relaxed text-marine-600">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
            <h2 className="font-serif text-xl font-bold text-marine-950">
              Créer mon compte
            </h2>
            <p className="mt-1 mb-6 text-sm text-marine-600">
              Gratuit, sans engagement, et résiliable à tout moment.
            </p>

            <CitizenSignupForm redirectTo={redirectTo} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
