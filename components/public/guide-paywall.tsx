import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { UnlockButton } from "@/components/compte/unlock-button";
import { formatFcfa } from "@/lib/utils";
import type { GuideDetail } from "@/lib/api/public";
import {
  IconCheck,
  IconLock,
  IconShieldCheck,
  IconSmartphone,
} from "@/components/ui/icons";

/**
 * Bloc de déblocage affiché à la fin d'un extrait — module 3.2.
 *
 * Une précision sur ce que ce composant n'est pas : ce n'est pas un masque. Le
 * texte verrouillé n'a jamais été envoyé au navigateur — l'API a coupé le
 * contenu avant de répondre. Un dégradé CSS par-dessus le texte complet aurait
 * la même apparence et aucune valeur : le contenu se lirait dans le code source
 * de la page.
 *
 * Ce que le lecteur voit ici, c'est donc la liste honnête de ce qui lui manque,
 * pas un rideau devant ce qu'il possède déjà.
 *
 * @param signedIn Un citoyen est connecté : il peut acquérir le guide sans
 *                 quitter la page. Sinon, l'appel à l'action mène à la création
 *                 de compte — un achat doit se rattacher à une bibliothèque,
 *                 sans quoi il serait perdu au prochain navigateur.
 */
export function GuidePaywall({
  guide,
  signedIn = false,
}: {
  guide: GuideDetail;
  signedIn?: boolean;
}) {
  const locked = guide.reading.outline.filter((section) => section.locked);
  const suite = `/guides/${guide.slug}`;

  return (
    <section
      className="guide-paywalled relative mt-2 overflow-hidden rounded-3xl border border-gold-500/30 bg-gold-50 p-7 sm:p-9"
      aria-labelledby="paywall-titre"
    >
      {/* Le dégradé rattache visuellement le bloc au texte qui le précède : la
          lecture s'estompe au lieu de s'interrompre net. */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-linear-to-b from-transparent to-gold-50"
        aria-hidden="true"
      />

      <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[0.7rem] font-bold tracking-wide text-gold-700 uppercase ring-1 ring-gold-500/25 ring-inset">
        <IconLock className="size-3.5" />
        La suite est réservée
      </p>

      <h2 id="paywall-titre" className="mt-5 font-serif text-2xl/snug font-bold text-marine-950">
        Vous avez lu {guide.reading.previewRatio} % de ce guide
      </h2>

      <p className="mt-3 max-w-xl text-[0.95rem]/relaxed text-marine-700">
        {locked.length > 0 ? (
          <>
            Il reste {locked.length}{" "}
            {locked.length > 1 ? "parties à découvrir" : "partie à découvrir"}, dont les
            modèles et les listes de pièces qui font l’essentiel de la valeur
            pratique du document.
          </>
        ) : (
          <>
            La fin du guide, avec les points pratiques et les modèles, se
            débloque en un paiement unique.
          </>
        )}
      </p>

      {locked.length > 0 && (
        <ul className="mt-6 space-y-2.5">
          {locked.map((section) => (
            <li key={section.title} className="flex items-start gap-3 text-[0.95rem] text-marine-800">
              <IconLock className="mt-0.5 size-4 shrink-0 text-gold-600" />
              {section.title}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-col gap-4 border-t border-gold-500/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-3xl font-bold text-marine-950">
            {formatFcfa(guide.price)}
          </p>
          <p className="mt-1 text-sm text-marine-600">Paiement unique, accès permanent.</p>
        </div>

        {signedIn ? (
          guide.free ? (
            // Rien à régler : l'ajout est immédiat, une page de paiement
            // intercalée ne ferait que retarder une lecture déjà due.
            <UnlockButton slug={guide.slug} price={guide.price} free={guide.free} />
          ) : (
            <Link href={`/guides/${guide.slug}/acheter`} className={buttonStyles({ size: "lg" })}>
              <IconSmartphone className="size-4.5" />
              Débloquer · {formatFcfa(guide.price)}
            </Link>
          )
        ) : (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Link
              href={`/compte/inscription?suite=${encodeURIComponent(`/guides/${guide.slug}/acheter`)}`}
              className={buttonStyles({ size: "lg" })}
            >
              <IconSmartphone className="size-4.5" />
              Débloquer le guide
            </Link>

            {/* La création de compte est mise devant parce qu'elle prend une
                minute et que la majorité des lecteurs n'en ont pas encore ; la
                connexion reste à portée, en second. */}
            <p className="text-center text-xs text-marine-600 sm:text-right">
              Compte gratuit en une minute ·{" "}
              <Link
                href={`/compte/connexion?suite=${encodeURIComponent(suite)}`}
                className="font-semibold underline underline-offset-2 hover:text-gold-700"
              >
                déjà inscrit ?
              </Link>
            </p>
          </div>
        )}
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-marine-600">
        <li className="inline-flex items-center gap-1.5">
          <IconCheck className="size-4 text-trust-600" />
          Mobile Money ou carte bancaire
        </li>
        <li className="inline-flex items-center gap-1.5">
          <IconShieldCheck className="size-4 text-trust-600" />
          Aucune donnée bancaire sur nos serveurs
        </li>
      </ul>
    </section>
  );
}
