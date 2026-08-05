"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { postJson } from "@/lib/api/client";
import { formatFcfa } from "@/lib/utils";
import type { UnlockResult } from "@/lib/api/types";
import { IconAlert, IconSmartphone } from "@/components/ui/icons";

/**
 * Bouton d'acquisition d'un guide, pour un citoyen connecté.
 *
 * ⚠️ Tant que le module de paiement n'est pas livré, le backend accepte les
 * guides payants sans prestataire (voir TAL_REST_Client::simulated_payments).
 * Ce bouton est donc, en développement, une caisse enregistreuse sans caisse.
 * Le contournement se coupe de lui-même en production ; le composant, lui, n'a
 * rien à changer le jour où un vrai tunnel s'intercalera : il continuera de
 * lire `unlocked` pour savoir si le guide s'est ouvert.
 */
export function UnlockButton({
  slug,
  price,
  free,
}: {
  slug: string;
  price: number;
  free: boolean;
}) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const unlock = async () => {
    setPending(true);
    setError("");

    const result = await postJson<UnlockResult>(
      `/api/compte/guides/${encodeURIComponent(slug)}/deblocage`,
      {},
    );

    if (!result.ok || !result.data) {
      setPending(false);
      setError(result.message);
      return;
    }

    if (!result.data.unlocked) {
      // Paiement engagé mais pas confirmé : le guide reste fermé, et le message
      // du serveur explique pourquoi mieux qu'une phrase écrite ici.
      setPending(false);
      setError(result.data.message);
      return;
    }

    // `pending` reste vrai : le rafraîchissement va remplacer cette page par sa
    // version débloquée, et réactiver le bouton laisserait un second achat
    // possible entre-temps.
    router.refresh();
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={unlock}
        disabled={pending}
        aria-busy={pending || undefined}
        className={buttonStyles({ size: "lg" })}
      >
        <IconSmartphone className="size-4.5" />
        {pending
          ? "Déblocage…"
          : free
            ? "Ajouter à ma bibliothèque"
            : `Débloquer · ${formatFcfa(price)}`}
      </button>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm/relaxed font-medium text-danger-700"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
