import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { LawyerCard } from "@/components/public/lawyer-card";
import { groupDigits } from "@/lib/utils";
import type { DirectoryEntry, PlatformStats } from "@/lib/api/public";
import { IconArrowRight } from "@/components/ui/icons";

/** Annuaire — aperçu des profils publics (module 2.1) avec badges (8.3). */
export function FeaturedLawyers({
  lawyers,
  stats,
}: {
  lawyers: DirectoryEntry[];
  stats: PlatformStats;
}) {
  // Sans backend joignable, la section disparaît plutôt que d'afficher une
  // grille vide sous un titre qui promet un annuaire.
  if (lawyers.length === 0) return null;

  return (
    <section className="bg-panel py-20 lg:py-28" aria-labelledby="avocats-titre">
      <div className="container-page">
        <SectionHeading
          eyebrow="Annuaire vérifié"
          title={<span id="avocats-titre">Des avocats vérifiés, pas des annonces</span>}
          description="Carte professionnelle et inscription au Barreau contrôlées avant publication. Les honoraires indicatifs sont affichés sur chaque fiche."
          action={
            <Link href="/avocats" className={buttonStyles({ variant: "outline", size: "sm" })}>
              Parcourir les {groupDigits(stats.directory)} profils
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {lawyers.slice(0, 4).map((lawyer) => (
            <LawyerCard key={lawyer.slug} lawyer={lawyer} />
          ))}
        </ul>
      </div>
    </section>
  );
}
