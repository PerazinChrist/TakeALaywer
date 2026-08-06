"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { postJson } from "@/lib/api/client";
import type { AppNotification } from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconBell,
  IconCalendar,
  IconCheck,
  IconMessages,
  IconStar,
  IconUsers,
} from "@/components/ui/icons";

/**
 * Pictogramme et teinte par famille de notification.
 *
 * La correspondance est faite sur le préfixe : le backend nomme ses types
 * « booking.confirme », « booking.refuse »… et distinguer chaque statut par une
 * icône propre n'apporterait rien — c'est le titre qui porte l'information.
 */
const families: { prefix: string; Icon: typeof IconBell; tone: string; label: string }[] = [
  { prefix: "message.", Icon: IconMessages, tone: "bg-marine-950/6 text-marine-700", label: "Message" },
  { prefix: "need.", Icon: IconUsers, tone: "bg-gold-500/12 text-gold-700", label: "Communauté" },
  { prefix: "booking.", Icon: IconCalendar, tone: "bg-trust-500/12 text-trust-700", label: "Rendez-vous" },
  { prefix: "appointment.", Icon: IconCalendar, tone: "bg-trust-500/12 text-trust-700", label: "Rendez-vous" },
  { prefix: "review.", Icon: IconStar, tone: "bg-gold-500/12 text-gold-700", label: "Avis" },
];

function familyOf(type: string) {
  return (
    families.find((family) => type.startsWith(family.prefix)) ?? {
      Icon: IconBell,
      tone: "bg-marine-950/6 text-marine-700",
      label: "Notification",
    }
  );
}

/**
 * Le centre de notifications d'un versant.
 *
 * Chaque entrée mène à l'élément qu'elle annonce — c'est le point : une
 * notification qu'on ne peut pas ouvrir ne sert qu'à inquiéter. Le lien est
 * calculé par le backend au moment où l'événement se produit, donc il reste
 * juste même si les règles d'URL changent ensuite.
 *
 * Cliquer marque comme lu, puis navigue. L'état local retombe immédiatement :
 * attendre la réponse du serveur pour éteindre la pastille ferait clignoter
 * l'entrée pendant la navigation.
 */
export function NotificationList({
  initial,
  viewer,
}: {
  initial: AppNotification[];
  viewer: "client" | "account";
}) {
  const router = useRouter();

  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");

  const param = viewer === "account" ? "avocat" : "citoyen";
  const unread = items.filter((item) => !item.read).length;

  const markRead = async (id?: string) => {
    setItems((current) =>
      current.map((item) => (id === undefined || item.id === id ? { ...item, read: true } : item)),
    );

    const result = await postJson("/api/notifications/lues", { id: id ?? 0, viewer: param });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    // L'en-tête est rendu côté serveur : sans ce rafraîchissement, sa pastille
    // resterait allumée jusqu'à la prochaine navigation complète.
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-marine-300 bg-white px-6 py-16 text-center">
        <span
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400"
          aria-hidden="true"
        >
          <IconBell className="size-6" />
        </span>

        <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
          Rien de neuf
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
          Réponses à vos messages, suites données à vos demandes de rendez-vous,
          réactions à vos publications : tout arrivera ici.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {unread > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-marine-600">
            <span className="font-bold text-marine-950">{unread}</span> non{" "}
            {unread > 1 ? "lues" : "lue"}
          </p>

          <button
            type="button"
            onClick={() => markRead()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
          >
            <IconCheck className="size-4" />
            Tout marquer comme lu
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const { Icon, tone, label } = familyOf(item.type);
          // Le versant voyage dans le lien : une notification praticien doit
          // ouvrir le fil côté praticien, même si un cookie citoyen traîne.
          const href = item.link
            ? `${item.link}${item.link.includes("?") ? "&" : "?"}profil=${param}`
            : "";

          const content = (
            <>
              <span
                className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}
                aria-hidden="true"
              >
                <Icon className="size-4.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      item.read ? "text-marine-700" : "font-semibold text-marine-950",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="text-xs text-marine-500">{item.date}</span>
                </span>

                {item.body && (
                  <span className="mt-0.5 block line-clamp-2 text-sm/relaxed text-marine-600">
                    {item.body}
                  </span>
                )}

                <span className="mt-1.5 block text-[0.7rem] font-bold tracking-wide text-marine-400 uppercase">
                  {label}
                </span>
              </span>

              {!item.read && (
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-full bg-gold-500"
                  aria-label="Non lue"
                />
              )}

              {href && (
                <IconArrowRight className="mt-1 size-4 shrink-0 text-marine-300" />
              )}
            </>
          );

          const className = cn(
            "flex w-full items-start gap-4 rounded-2xl p-4 text-left shadow-card ring-1 transition-colors sm:p-5",
            item.read
              ? "bg-white ring-marine-950/6 hover:ring-gold-500/30"
              : "bg-gold-50/60 ring-gold-500/25 hover:ring-gold-500/50",
          );

          return (
            <li key={item.id}>
              {href ? (
                <Link href={href} onClick={() => markRead(item.id)} className={className}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={() => markRead(item.id)} className={className}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
