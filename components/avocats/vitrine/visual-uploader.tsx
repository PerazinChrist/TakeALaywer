"use client";

import { useState } from "react";
import { del, postForm } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { IconCamera, IconTrash } from "@/components/ui/icons";

/**
 * Dépôt et retrait d'un visuel de vitrine — avatar ou couverture.
 *
 * Posé directement sur l'en-tête plutôt que dans un formulaire dédié : c'est là
 * que le praticien voit le résultat, et l'aller-retour vers un onglet
 * « Médias » ferait perdre le contexte visuel qui justifie le remplacement.
 */
export function VisualUploader({
  slot,
  hasVisual,
  label,
  shortLabel,
  compact = false,
  onChange,
}: {
  slot: "avatar" | "couverture";
  hasVisual: boolean;
  label: string;
  shortLabel?: string;
  /** Bouton rond, pour l'avatar : pas de place pour un libellé. */
  compact?: boolean;
  onChange?: (url: string | null) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setPending(true);
    setError("");

    const body = new FormData();
    body.set("file", file);

    const result = await postForm<{ url: string | null }>(
      `/api/avocats/visuels/${slot}`,
      body,
    );

    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onChange?.(result.data?.url ?? null);
  };

  const remove = async () => {
    setPending(true);
    setError("");

    const result = await del(`/api/avocats/visuels/${slot}`);

    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onChange?.(null);
  };

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <label
        title={label}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 bg-white/95 font-semibold text-marine-900 shadow-card backdrop-blur-sm transition-colors hover:bg-white",
          compact
            ? "grid size-9 place-items-center rounded-full ring-1 ring-marine-950/10 hover:text-gold-700"
            : "rounded-lg px-3.5 py-2 text-sm",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) void upload(file);
            // Réinitialiser permet de redéposer le même fichier après un refus.
            event.target.value = "";
          }}
        />

        <IconCamera className={compact ? "size-4.5" : "size-4"} />

        {!compact && (
          <>
            <span className="max-sm:hidden">{pending ? "Envoi…" : label}</span>
            <span className="sm:hidden">{pending ? "Envoi…" : (shortLabel ?? label)}</span>
          </>
        )}

        {compact && <span className="sr-only">{label}</span>}
      </label>

      {hasVisual && !compact && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Retirer ${label.toLowerCase()}`}
          className="grid size-9 place-items-center rounded-lg bg-white/95 text-marine-700 shadow-card backdrop-blur-sm transition-colors hover:bg-white hover:text-danger-600 disabled:opacity-60"
        >
          <IconTrash className="size-4" />
        </button>
      )}

      {error && (
        <span
          role="alert"
          className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-danger-600 p-3 text-xs/relaxed font-medium text-white shadow-card"
        >
          {error}
        </span>
      )}
    </span>
  );
}
