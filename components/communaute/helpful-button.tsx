"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { postJson } from "@/lib/api/client";
import { IconThumbsUp } from "@/components/ui/icons";

/**
 * Bouton « ça m'a été utile ».
 *
 * Le compteur est optimiste puis corrigé par la réponse du serveur : c'est un
 * geste de lecture, il doit répondre immédiatement, et un décalage d'une unité
 * pendant 200 ms ne trompe personne.
 *
 * Un second clic n'est pas une erreur — c'est le même avis exprimé deux fois.
 * Le backend renvoie `counted: false`, le bouton reste simplement actif : il n'y
 * a rien à annoncer.
 */
export function HelpfulButton({
  target,
  id,
  count,
  voted = false,
  compact = false,
}: {
  /** « besoin » ou « reponse » — décide de la route appelée. */
  target: "besoin" | "reponse";
  /** Slug du besoin, ou identifiant de la réponse. */
  id: string;
  count: number;
  voted?: boolean;
  compact?: boolean;
}) {
  const [total, setTotal] = useState(count);
  const [active, setActive] = useState(voted);
  const [pending, setPending] = useState(false);

  const vote = async () => {
    if (active || pending) return;

    setPending(true);
    setActive(true);
    setTotal((current) => current + 1);

    const path =
      target === "besoin"
        ? `/api/besoins/${encodeURIComponent(id)}/utile`
        : `/api/reponses/${encodeURIComponent(id)}/utile`;

    const result = await postJson<{ helpful: number; counted: boolean }>(path, {});

    setPending(false);

    if (result.ok && result.data) {
      setTotal(result.data.helpful);
      return;
    }

    // L'appel a échoué : le compteur revient à sa valeur réelle plutôt que de
    // laisser croire à un vote enregistré.
    setActive(voted);
    setTotal(count);
  };

  return (
    <button
      type="button"
      onClick={vote}
      disabled={pending}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors",
        compact ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
        active
          ? "bg-trust-500/12 text-trust-700 ring-1 ring-trust-500/25 ring-inset"
          : "bg-marine-50 text-marine-600 ring-1 ring-marine-950/8 ring-inset hover:bg-gold-50 hover:text-gold-700",
      )}
    >
      <IconThumbsUp className={compact ? "size-3.5" : "size-4"} />
      {active ? "Utile" : "Ça m’a été utile"}
      <span className={cn("tabular-nums", active ? "text-trust-600" : "text-marine-400")}>
        {total}
      </span>
    </button>
  );
}
