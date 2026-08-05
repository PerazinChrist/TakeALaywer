import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { CitizenLoginForm } from "@/components/compte/login-form";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { IconFileText, IconStar, IconUser } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Connexion à mon espace",
  description: "Retrouvez vos guides débloqués, vos avis et l’historique de vos démarches.",
  alternates: { canonical: "/compte/connexion" },
  robots: { index: false, follow: false },
};

const ESPACE = "/compte";

const points = [
  { icon: IconFileText, text: "Vos guides et modèles débloqués" },
  { icon: IconStar, text: "Les avis que vous avez laissés" },
  { icon: IconUser, text: "Vos informations, modifiables à tout moment" },
];

export default async function ConnexionCitoyenPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const session = await fetchCurrentClient();

  if (session) {
    redirect(ESPACE);
  }

  const { suite } = await searchParams;

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
              Content de vous revoir
            </h1>
            <p className="mt-5 max-w-xl text-lg/relaxed text-marine-950/70">
              Connectez-vous avec l’adresse e-mail utilisée à la création de
              votre compte.
            </p>

            <ul className="mt-8 space-y-3">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-marine-800">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold-500/12 text-gold-700"
                    aria-hidden="true"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm/relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
            <h2 className="font-serif text-xl font-bold text-marine-950">Connexion</h2>
            <p className="mt-1 mb-6 text-sm text-marine-600">
              Vos identifiants sont ceux créés à l’inscription.
            </p>

            <CitizenLoginForm redirectTo={redirectTo} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
