"use client";

import { useState } from "react";
import { AdminCard } from "@/components/avocats/admin/admin-ui";
import { buttonStyles } from "@/components/ui/button";
import { postForm } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ApiDocument } from "@/lib/api/types";
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconShieldCheck,
  IconUpload,
} from "@/components/ui/icons";

/** Apparence de chaque état renvoyé par le backend. */
const states: Record<string, { label: string; tone: string; dot: string }> = {
  manquant: {
    label: "Non déposé",
    tone: "border-marine-950/15 bg-white",
    dot: "bg-marine-950/6 text-marine-600",
  },
  en_attente: {
    label: "En cours de vérification",
    tone: "border-gold-500/40 bg-gold-50/60",
    dot: "bg-gold-500 text-white",
  },
  valide: {
    label: "Validé",
    tone: "border-trust-500/50 bg-trust-500/5",
    dot: "bg-trust-500 text-white",
  },
  refuse: {
    label: "Refusé",
    tone: "border-danger-500/50 bg-danger-50",
    dot: "bg-danger-500 text-white",
  },
};

/**
 * Dépôt et suivi des pièces justificatives.
 *
 * Contrepartie indispensable d'une inscription qui n'exige plus aucune pièce :
 * c'est ici que le praticien complète son dossier, à son rythme, et voit où en
 * est chaque contrôle.
 */
export function SectionJustificatifs({ documents }: { documents: ApiDocument[] }) {
  const [items, setItems] = useState(documents);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const upload = async (type: string, file: File) => {
    setBusy(type);
    setError("");

    const body = new FormData();
    body.set("type", type);
    body.set("file", file);

    const result = await postForm<{ documents: ApiDocument[] }>(
      "/api/avocats/justificatifs",
      body,
    );

    if (!result.ok) {
      setError(result.message);
      setBusy(null);
      return;
    }

    // Le backend renvoie la liste complète recalculée : l'adopter évite de
    // deviner localement le nouvel état de la pièce.
    if (result.data?.documents) {
      setItems(
        result.data.documents.map((entry) => ({
          type: entry.type,
          label: entry.label,
          required: entry.required,
          status: entry.status,
          originalName: entry.originalName ?? null,
          uploadedAt: entry.uploadedAt ?? null,
          reviewNote: entry.reviewNote ?? null,
        })),
      );
    }

    setBusy(null);
  };

  const remaining = items.filter((item) => item.required && item.status === "manquant").length;

  return (
    <div className="space-y-5">
      <AdminCard
        title="Pièces justificatives"
        description={
          remaining === 0
            ? "Votre dossier est complet. Notre équipe finalise la vérification."
            : `${remaining} pièce${remaining > 1 ? "s" : ""} à fournir pour lancer la vérification de votre compte.`
        }
      >
        <p className="mb-5 flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
          <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
          Vos pièces sont stockées hors de la médiathèque publique et ne sont
          consultées que par l’équipe de vérification. Elles n’apparaissent
          jamais sur votre vitrine.
        </p>

        {error && (
          <p
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
          >
            <IconAlert className="mt-0.5 size-4.5 shrink-0" />
            {error}
          </p>
        )}

        <ul className="space-y-3">
          {items.map((item) => {
            const state = states[item.status] ?? states.manquant;
            const pending = busy === item.type;

            return (
              <li key={item.type}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-5 transition-colors",
                    state.tone,
                    pending && "opacity-60",
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    disabled={pending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload(item.type, file);
                      // Réinitialiser permet de redéposer le même fichier après
                      // un refus : sans cela, choisir deux fois le même nom ne
                      // déclenche aucun événement.
                      event.target.value = "";
                    }}
                  />

                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl",
                      state.dot,
                    )}
                  >
                    {item.status === "valide" ? (
                      <IconCheck className="size-5" strokeWidth={3} />
                    ) : item.status === "en_attente" ? (
                      <IconClock className="size-5" />
                    ) : (
                      <IconUpload className="size-5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-marine-950">
                      {item.label}
                      <span
                        className={cn(
                          "text-xs font-normal",
                          item.required ? "text-gold-700" : "text-marine-400",
                        )}
                      >
                        {item.required ? "attendu pour la vérification" : "facultatif"}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-marine-500">
                      {pending
                        ? "Envoi en cours…"
                        : item.originalName
                          ? `${state.label} · ${item.originalName}`
                          : state.label}
                    </span>
                    {item.reviewNote && (
                      <span className="mt-1 block text-xs text-danger-600">
                        {item.reviewNote}
                      </span>
                    )}
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-gold-700">
                    {item.status === "manquant" ? "Déposer" : "Remplacer"}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs/relaxed text-marine-500">
          Formats acceptés : PDF, JPG, PNG, WebP. 8 Mo par fichier au maximum.
        </p>
      </AdminCard>
    </div>
  );
}

/** Bouton de déconnexion, isolé pour rester au plus près de son état. */
export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/avocats/deconnexion", { method: "POST" });
        // Rechargement complet plutôt que router.push : il vide au passage tout
        // état client hérité de la session qu'on vient de fermer.
        window.location.href = "/avocats/connexion";
      }}
      className={buttonStyles({
        // « ghost » est blanc sur transparent, prévu pour les fonds sombres :
        // il disparaîtrait dans le rail clair de l'espace praticien.
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
