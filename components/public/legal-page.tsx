import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { IconAlert } from "@/components/ui/icons";

/** Une section numérotée d'un document institutionnel. */
export type LegalSection = {
  /** Sert d'ancre : `#{id}` doit rester stable, un lien externe peut le viser. */
  id: string;
  title: string;
  body: ReactNode;
};

/**
 * Coquille commune aux pages institutionnelles.
 *
 * Mentions légales, charte, CGU et politique de données ont la même structure :
 * un titre, une date de mise à jour, un sommaire ancré et des sections
 * numérotées. Les écrire quatre fois aurait garanti quatre mises en page
 * divergentes au premier ajout de clause.
 *
 * L'avertissement de relecture juridique n'est pas décoratif : ces textes sont
 * une trame de travail, pas un document validé par un avocat. Le taire
 * laisserait croire le contraire à quiconque ouvre la page.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
  image,
  imagePosition = "center",
  imageVeil,
  draft = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
  /**
   * Illustration du bandeau, dans `/public/headers/`.
   *
   * Obligatoire : ces quatre pages partagent une seule coquille, et la rendre
   * facultative laisserait une page revenir au bandeau blanc sans que personne
   * s'en aperçoive avant la mise en ligne.
   */
  image: string;
  /** Cadrage de l'image, en valeurs `background-position`. */
  imagePosition?: string;
  /** Densité du voile. À baisser sur une photo déjà sombre. */
  imageVeil?: number;
  /** Le document attend encore une validation juridique. */
  draft?: boolean;
}) {
  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        {/* Même traitement que les bandeaux de l'annuaire et de la
            bibliothèque : fond marine, photographie en fond, texte en clair.
            `isolate` crée le contexte d'empilement dans lequel le `-z-10` du
            décor reste derrière le texte sans passer sous la page. */}
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          <PageHeaderBackdrop
            image={image}
            position={imagePosition}
            veil={imageVeil}
          />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">{intro}</p>
            <p className="mt-6 text-sm text-marine-200">Dernière mise à jour : {updatedAt}</p>
          </div>
        </header>

        <div className="container-page py-12 lg:py-16">
          {draft && (
            <p className="mb-10 flex items-start gap-3 rounded-2xl border border-gold-500/30 bg-gold-50 p-5 text-sm/relaxed text-marine-800">
              <IconAlert className="mt-0.5 size-5 shrink-0 text-gold-700" />
              <span>
                <strong className="font-semibold">Document de travail.</strong> Ce
                texte décrit les engagements que la plateforme entend tenir. Il
                n’a pas encore été relu par un avocat et ne peut pas être opposé
                en l’état. La version définitive sera publiée avant l’ouverture
                au public.
              </span>
            </p>
          )}

          <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <nav
              aria-label="Sommaire"
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                Sommaire
              </p>
              <ol className="mt-4 space-y-2.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      className="flex gap-2.5 text-sm/snug text-marine-600 transition-colors hover:text-gold-700"
                    >
                      <span className="shrink-0 font-semibold text-marine-400">
                        {index + 1}.
                      </span>
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  // `scroll-mt` compense l'en-tête collant : sans elle, le titre
                  // visé par une ancre se retrouve caché derrière la barre.
                  className="scroll-mt-24"
                >
                  <h2 className="font-serif text-2xl/snug font-bold text-marine-950">
                    <span className="text-gold-600">{index + 1}.</span> {section.title}
                  </h2>
                  <div className="prose-guide mt-4 max-w-none">{section.body}</div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
