"use client";

import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { TextArea } from "@/components/ui/form";
import { AdminCard } from "@/components/avocats/admin/admin-ui";
import { cn } from "@/lib/utils";
import { plans } from "@/lib/avocats/signup";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";
import {
  IconBadgeCheck,
  IconCheck,
  IconCrown,
  IconPencil,
  IconSend,
  IconStar,
} from "@/components/ui/icons";

/**
 * Sections de l'espace de gestion qui restent en lecture seule.
 *
 * Les autres — compte, vitrine, galerie, guides, prestations — vivent chacune
 * dans son fichier, avec son état et ses appels réseau. Avis et abonnement
 * n'écrivent rien pour l'instant : la réponse aux avis et le changement de
 * formule passeront par des endpoints déjà exposés par le plugin, mais qui
 * demandent d'abord une décision produit sur la facturation.
 */

/* -------------------------------------------------------------------------- */
/* Avis                                                                       */
/* -------------------------------------------------------------------------- */

export function SectionAvis({ profile }: { profile: LawyerProfile }) {
  return (
    <div className="space-y-5">
      <AdminCard
        title="Réputation"
        description="Les avis ne sont collectés qu’après une consultation réelle et ne peuvent pas être supprimés — vous pouvez y répondre."
      >
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="font-serif text-4xl font-bold text-marine-950">
              {profile.rating.toFixed(1).replace(".", ",")}
            </p>
            <Rating value={profile.rating} className="mt-1" />
          </div>
          <div className="text-sm text-marine-600">
            <p>
              <span className="font-semibold text-marine-950">
                {profile.reviewsCount} avis
              </span>{" "}
              certifiés
            </p>
            <p className="mt-1">
              <span className="font-semibold text-marine-950">
                {profile.reviews.filter((r) => r.reply).length}
              </span>{" "}
              réponses publiées
            </p>
          </div>
        </div>
      </AdminCard>

      {profile.reviews.length === 0 && (
        <AdminCard title="Aucun avis pour l’instant">
          <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            <IconStar className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
            Les avis arrivent après vos premières consultations passées par la
            plateforme. Ils sont vérifiés avant publication.
          </p>
        </AdminCard>
      )}

      {profile.reviews.map((review) => (
        <AdminCard key={review.id} title={review.author}>
          <div className="-mt-3 flex flex-wrap items-center gap-3">
            <Avatar initials={review.initials} size="sm" />
            <Rating value={review.rating} />
            <span className="text-xs text-marine-500">
              {review.context} · {review.date}
            </span>
          </div>

          <p className="mt-4 text-sm/relaxed text-marine-700">{review.quote}</p>

          {review.reply ? (
            <div className="mt-4 rounded-xl bg-marine-50 p-4">
              <p className="mb-1 flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-marine-900 uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <IconBadgeCheck className="size-3.5 text-gold-500" />
                  Votre réponse publiée
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gold-700 normal-case hover:underline"
                >
                  <IconPencil className="size-3.5" />
                  Modifier
                </button>
              </p>
              <p className="text-sm/relaxed text-marine-700">{review.reply}</p>
            </div>
          ) : (
            <div className="mt-4">
              <TextArea
                aria-label={`Répondre à ${review.author}`}
                placeholder="Répondre publiquement — sans jamais évoquer le contenu du dossier."
                className="min-h-24"
              />
              <button
                type="button"
                className={buttonStyles({ size: "sm", className: "mt-3" })}
              >
                <IconSend className="size-4" />
                Publier ma réponse
              </button>
            </div>
          )}
        </AdminCard>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Abonnement                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Détail de la formule en cours.
 *
 * Piloté par l'identifiant renvoyé par le backend plutôt que par une paire de
 * branches : avec des données réelles, un compte Essentiel se serait affiché
 * comme Premium, prélèvement mensuel compris.
 */
const planDetails = {
  essentiel: {
    price: "Gratuit",
    note: "Votre fiche est visible dans l’annuaire. Passez à Premium pour être mis en avant et vendre vos guides.",
    answers: "5 par mois",
    commission: "30 %",
    featured: "Inactive",
  },
  premium: {
    price: "15 000 FCFA / mois",
    note: "Prochain prélèvement Mobile Money le 5 du mois prochain.",
    answers: "Illimitées",
    commission: "20 %",
    featured: "Active",
  },
  pionnier: {
    price: "Offerte à vie",
    note: "Vous faites partie des 500 premiers avocats inscrits. Cet avantage vous est acquis.",
    answers: "Illimitées",
    commission: "10 %",
    featured: "Active",
  },
} as const;

export function SectionAbonnement({ profile }: { profile: LawyerProfile }) {
  const details = planDetails[profile.plan] ?? planDetails.essentiel;
  const currentName = plans.find((plan) => plan.id === profile.plan)?.name ?? "Essentiel";

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-marine-950 p-7 text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-3 py-1 text-[0.7rem] font-bold tracking-[0.18em] text-gold-300 uppercase">
          <IconCrown className="size-3.5" />
          Formule {currentName}
        </p>

        <p className="mt-4 font-serif text-3xl font-bold">{details.price}</p>
        <p className="mt-2 text-marine-200">{details.note}</p>

        <dl className="mt-6 grid gap-4 border-t border-white/12 pt-6 sm:grid-cols-3">
          {[
            { label: "Réponses aux besoins", value: details.answers },
            { label: "Commission sur les guides", value: details.commission },
            { label: "Mise en avant accueil", value: details.featured },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-sm text-marine-300">{row.label}</dt>
              <dd className="mt-0.5 font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <AdminCard
        title="Changer de formule"
        description="Le changement prend effet au prochain cycle de facturation."
      >
        <ul className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const current = plan.id === profile.plan;

            return (
              <li
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border-2 p-5",
                  current ? "border-gold-500 bg-gold-50/60" : "border-marine-950/10",
                )}
              >
                <p className="font-serif text-lg font-bold text-marine-950">{plan.name}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-serif text-xl font-bold text-gold-700">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-marine-500">{plan.period}</span>
                  )}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-[0.8rem]/snug text-marine-700"
                    >
                      <IconCheck className="mt-px size-3.5 shrink-0 text-trust-600" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={current}
                  className={buttonStyles({
                    variant: current ? "soft" : "outline",
                    size: "sm",
                    full: true,
                    className: "mt-5 border-marine-950/15",
                  })}
                >
                  {current ? "Formule actuelle" : "Choisir"}
                </button>
              </li>
            );
          })}
        </ul>
      </AdminCard>
    </div>
  );
}
