"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { AdminCard, StatCard } from "@/components/avocats/admin/admin-ui";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { Rating } from "@/components/ui/rating";
import { CitizenAccountSection } from "@/components/compte/section-compte";
import { cn, formatFcfa, groupDigits } from "@/lib/utils";
import type {
  ClientActivity,
  ClientMeResult,
  ClientPurchase,
  ClientReview,
} from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconDownload,
  IconFileText,
  IconGrid,
  IconLock,
  IconSearch,
  IconStar,
  IconUserCog,
} from "@/components/ui/icons";

const navigation = [
  { id: "tableau", label: "Tableau de bord", Icon: IconGrid },
  { id: "guides", label: "Mes guides", Icon: IconFileText },
  { id: "avis", label: "Mes avis", Icon: IconStar },
  { id: "activite", label: "Mon activité", Icon: IconClock },
  { id: "compte", label: "Mon compte", Icon: IconUserCog },
] as const;

/**
 * Espace personnel du citoyen.
 *
 * Bâti sur le même rail que l'espace praticien, mais sans ce qui n'existe pas
 * de ce côté : ni vitrine, ni justificatifs, ni abonnement. Restent la
 * bibliothèque, les avis déposés et le journal — c'est-à-dire la trace de ce
 * que la personne a réellement fait sur le site.
 *
 * L'état est tenu ici et non dans chaque section : modifier son pseudonyme doit
 * se voir immédiatement dans le rail, sans recharger la page.
 */
export function CitizenSpace({ session }: { session: ClientMeResult }) {
  const [section, setSection] = useState<string>("tableau");
  const [client, setClient] = useState(session.client);

  const { stats, purchases, reviews, activity } = session;

  const initials = buildInitials(client);
  const pending = purchases.filter((purchase) => purchase.status === "en_attente");

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-10 lg:py-10">
      {/* ---------------- Rail de navigation ---------------- */}
      {/* `min-w-0` : sans lui, la largeur du rail défilant devient la largeur
          minimale de la colonne, et la page déborde à l'horizontale sur mobile. */}
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-marine-950/6">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-marine-950">{client.pseudonym}</p>
            <p className="truncate text-xs text-marine-500">{client.email}</p>
          </div>
        </div>

        <nav
          className="scrollbar-none flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible"
          aria-label="Sections de mon espace"
        >
          {navigation.map(({ id, label, Icon }) => {
            const active = id === section;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-marine-950 text-white"
                    : "text-marine-700 hover:bg-white hover:text-marine-950",
                )}
              >
                <Icon className={cn("size-4.5", active ? "text-gold-400" : "text-marine-400")} />
                {label}
              </button>
            );
          })}
        </nav>

        <Link
          href="/guides"
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            full: true,
            className: "mt-5 border-marine-950/15 bg-white",
          })}
        >
          <IconSearch className="size-4" />
          Explorer la bibliothèque
        </Link>

        <SignOutButton />
      </aside>

      {/* ---------------- Section courante ---------------- */}
      <div className="min-w-0">
        {pending.length > 0 && (
          <p className="mb-6 flex flex-wrap items-start gap-3 rounded-2xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
            <IconAlert className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
            <span className="min-w-0 flex-1">
              <span className="font-semibold">
                {pending.length === 1
                  ? "Un paiement attend confirmation"
                  : `${pending.length} paiements attendent confirmation`}
              </span>
              <span className="mt-0.5 block">
                Le guide s’ouvrira automatiquement dès que la transaction sera
                validée. Rien de plus à faire de votre côté.
              </span>
            </span>
          </p>
        )}

        {section === "tableau" && (
          <Dashboard
            stats={stats}
            purchases={purchases}
            activity={activity}
            onNavigate={setSection}
          />
        )}

        {section === "guides" && <Library purchases={purchases} />}

        {section === "avis" && <Reviews reviews={reviews} />}

        {section === "activite" && <ActivityLog entries={activity} />}

        {section === "compte" && (
          <CitizenAccountSection client={client} onUpdated={setClient} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tableau de bord                                                            */
/* -------------------------------------------------------------------------- */

function Dashboard({
  stats,
  purchases,
  activity,
  onNavigate,
}: {
  stats: ClientMeResult["stats"];
  purchases: ClientPurchase[];
  activity: ClientActivity[];
  onNavigate: (section: string) => void;
}) {
  const recent = purchases.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={stats.purchases > 1 ? "guides à moi" : "guide à moi"}
          value={groupDigits(stats.purchases)}
          icon={<IconFileText className="size-5" />}
        />
        <StatCard
          label="dépensés en tout"
          value={formatFcfa(stats.spent)}
          icon={<IconDownload className="size-5" />}
        />
        <StatCard
          label={stats.reviews > 1 ? "avis déposés" : "avis déposé"}
          value={groupDigits(stats.reviews)}
          icon={<IconStar className="size-5" />}
        />
      </div>

      <AdminCard
        title="Ma bibliothèque"
        description="Les derniers documents entrés dans votre espace."
        action={
          purchases.length > 3 ? (
            <button
              type="button"
              onClick={() => onNavigate("guides")}
              className="text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              Tout voir
            </button>
          ) : undefined
        }
      >
        {recent.length > 0 ? (
          <ul className="space-y-3">
            {recent.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}
          </ul>
        ) : (
          <EmptyLibrary />
        )}
      </AdminCard>

      <AdminCard
        title="Dernières actions"
        description="Ce que vous avez fait sur le site, du plus récent au plus ancien."
        action={
          activity.length > 5 ? (
            <button
              type="button"
              onClick={() => onNavigate("activite")}
              className="text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              Tout le journal
            </button>
          ) : undefined
        }
      >
        <ActivityList entries={activity.slice(0, 5)} />
      </AdminCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bibliothèque                                                               */
/* -------------------------------------------------------------------------- */

function Library({ purchases }: { purchases: ClientPurchase[] }) {
  if (purchases.length === 0) {
    return (
      <AdminCard title="Mes guides" description="Tout ce que vous avez débloqué, réuni ici.">
        <EmptyLibrary />
      </AdminCard>
    );
  }

  // Les guides encore publiés reprennent la carte du catalogue : reconnaître
  // ici la vignette vue au moment de l'achat vaut mieux qu'une liste inédite.
  const displayable = purchases.filter((purchase) => purchase.guide !== null);
  const orphans = purchases.filter((purchase) => purchase.guide === null);

  return (
    <div className="space-y-6">
      <AdminCard
        title="Mes guides"
        description={`${groupDigits(purchases.length)} ${
          purchases.length > 1 ? "documents acquis" : "document acquis"
        }. Accès permanent, sans nouvelle dépense.`}
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {displayable.map((purchase) => (
            <li key={purchase.id} className="flex flex-col">
              <div className="flex-1">
                <GuideShowcaseCard guide={purchase.guide!} />
              </div>
              <PurchaseFooter purchase={purchase} />
            </li>
          ))}
        </ul>

        {displayable.length === 0 && (
          <p className="text-sm/relaxed text-marine-600">
            Aucun de vos documents n’est actuellement publié dans la
            bibliothèque. Ils restent listés ci-dessous.
          </p>
        )}
      </AdminCard>

      {orphans.length > 0 && (
        <AdminCard
          title="Documents retirés du catalogue"
          description="Leur auteur ne les publie plus. Votre achat reste enregistré."
        >
          <ul className="space-y-3">
            {orphans.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}

/** Bandeau de reçu, sous la carte d'un guide de la bibliothèque. */
function PurchaseFooter({ purchase }: { purchase: ClientPurchase }) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-marine-500">
      <PurchaseStatus purchase={purchase} />
      <span>
        {purchase.amount > 0 ? formatFcfa(purchase.amount) : "Lecture libre"} ·{" "}
        {purchase.purchasedAt}
      </span>
      {purchase.reference && (
        <span className="font-mono text-[0.7rem] text-marine-400">{purchase.reference}</span>
      )}
    </p>
  );
}

/** Ligne compacte : tableau de bord et documents retirés du catalogue. */
function PurchaseRow({ purchase }: { purchase: ClientPurchase }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-marine-950/8 p-4">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-500"
        aria-hidden="true"
      >
        <IconFileText className="size-4.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-marine-950">
          {purchase.available ? (
            <Link href={`/guides/${purchase.slug}`} className="hover:text-gold-700">
              {purchase.title}
            </Link>
          ) : (
            purchase.title
          )}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-marine-500">
          <PurchaseStatus purchase={purchase} />
          <span>
            {purchase.amount > 0 ? formatFcfa(purchase.amount) : "Lecture libre"} ·{" "}
            {purchase.purchasedAt}
          </span>
        </span>
      </span>

      {purchase.available && (
        <Link
          href={`/guides/${purchase.slug}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Lire
          <IconArrowRight className="size-4" />
        </Link>
      )}
    </li>
  );
}

function PurchaseStatus({ purchase }: { purchase: ClientPurchase }) {
  if (purchase.status === "paye") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-trust-600">
        <IconCheck className="size-3.5" />
        {purchase.amount > 0 ? "Payé" : "Débloqué"}
      </span>
    );
  }

  if (purchase.status === "en_attente") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-gold-700">
        <IconLock className="size-3.5" />
        Paiement en attente
      </span>
    );
  }

  return <span className="font-semibold text-marine-500">{purchase.statusLabel}</span>;
}

function EmptyLibrary() {
  return (
    <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-12 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconFileText className="size-5" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">
        Votre bibliothèque est vide
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm/relaxed text-marine-600">
        Les guides que vous débloquez s’y rangent automatiquement et y restent,
        même des mois plus tard.
      </p>

      <Link href="/guides" className={buttonStyles({ size: "sm", className: "mt-6" })}>
        Découvrir les guides
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Avis                                                                       */
/* -------------------------------------------------------------------------- */

const reviewStatusLabels: Record<ClientReview["status"], { label: string; tone: string }> = {
  en_attente: { label: "En cours de vérification", tone: "text-gold-700" },
  publie: { label: "Publié", tone: "text-trust-600" },
  rejete: { label: "Non retenu", tone: "text-danger-600" },
};

function Reviews({ reviews }: { reviews: ClientReview[] }) {
  return (
    <AdminCard
      title="Mes avis"
      description="Ce que vous avez écrit sur les praticiens que vous avez consultés."
    >
      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-marine-300 px-6 py-10 text-center text-sm/relaxed text-marine-600">
          Vous n’avez encore laissé aucun avis. Ils se déposent depuis la fiche
          d’un avocat, après une consultation.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const status = reviewStatusLabels[review.status];

            return (
              <li key={review.id} className="rounded-2xl border border-marine-950/8 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-semibold text-marine-950">
                    {review.lawyer.slug ? (
                      <Link
                        href={`/avocats/${review.lawyer.slug}`}
                        className="hover:text-gold-700"
                      >
                        {review.lawyer.name}
                      </Link>
                    ) : (
                      review.lawyer.name || "Praticien retiré de l’annuaire"
                    )}
                  </p>
                  <span className={cn("text-xs font-semibold", status.tone)}>{status.label}</span>
                </div>

                <Rating value={review.rating} className="mt-2" compact />

                <p className="mt-3 text-sm/relaxed text-marine-700">{review.quote}</p>

                <p className="mt-3 text-xs text-marine-500">Déposé {review.date}</p>

                {review.reply && (
                  <p className="mt-4 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
                    <span className="block text-xs font-bold tracking-wide text-marine-500 uppercase">
                      Réponse du praticien
                    </span>
                    <span className="mt-1.5 block">{review.reply}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Journal                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Libellés des actions du journal.
 *
 * Le backend enregistre un identifiant court et une phrase déjà rédigée ; on ne
 * traduit ici que l'intitulé de la colonne de gauche, pour que la liste se lise
 * en diagonale sans dépendre de la longueur des détails.
 */
const actionLabels: Record<string, string> = {
  "client.register": "Compte créé",
  "client.login": "Connexion",
  "client.logout": "Déconnexion",
  "client.purchase": "Guide acquis",
  "client.profile": "Profil modifié",
  "client.password": "Mot de passe modifié",
};

function ActivityLog({ entries }: { entries: ClientActivity[] }) {
  return (
    <AdminCard
      title="Mon activité"
      description="Chaque connexion et chaque acquisition, conservées pour vous seul."
    >
      <ActivityList entries={entries} />
    </AdminCard>
  );
}

function ActivityList({ entries }: { entries: ClientActivity[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-marine-300 px-6 py-10 text-center text-sm/relaxed text-marine-600">
        Rien à afficher pour l’instant.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => (
        <li key={entry.id} className="flex gap-4">
          {/* Filet vertical reliant les puces : il donne la chronologie sans
              ajouter de texte, et s'arrête sur la dernière entrée. */}
          <span className="flex flex-col items-center" aria-hidden="true">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-gold-500" />
            {index < entries.length - 1 && (
              <span className="w-px flex-1 bg-marine-950/10" />
            )}
          </span>

          <span className="min-w-0 flex-1 pb-5">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold text-marine-950">
                {actionLabels[entry.action] ?? entry.action}
              </span>
              <span className="text-xs text-marine-500">{entry.date}</span>
            </span>
            {entry.detail && (
              <span className="mt-0.5 block text-sm/relaxed text-marine-600">{entry.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */

/** Bouton de déconnexion, isolé pour rester au plus près de son état. */
function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/compte/deconnexion", { method: "POST" });
        // Rechargement complet plutôt que router.push : il vide au passage tout
        // état client hérité de la session qu'on vient de fermer.
        window.location.href = "/";
      }}
      className={buttonStyles({
        variant: "outline",
        size: "sm",
        full: true,
        className: "mt-2 border-marine-950/15 bg-white text-marine-600 hover:text-danger-600",
      })}
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}

/**
 * Initiales de la pastille.
 *
 * Le pseudonyme d'abord : c'est l'identité que la personne a choisie, et la
 * seule dont on soit certain qu'elle est renseignée.
 */
function buildInitials(client: ClientMeResult["client"]): string {
  const source =
    [client.firstName, client.lastName].filter(Boolean).join(" ") ||
    client.pseudonym ||
    client.email;

  const words = source.trim().split(/[\s-]+/).filter(Boolean);

  if (words.length === 0) return "?";

  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";

  return (first + last).toUpperCase();
}
