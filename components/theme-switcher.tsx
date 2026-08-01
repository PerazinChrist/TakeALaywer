"use client";

import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconClose, IconPalette } from "@/components/ui/icons";

/**
 * Sélecteur de thème — OUTIL TEMPORAIRE.
 *
 * Sert à comparer les trois colorimétries en conditions réelles. Une fois le
 * thème arrêté : supprimer ce fichier, son montage dans app/page.tsx, le script
 * anti-flash de app/layout.tsx, et ne garder qu'un bloc de variables dans
 * globals.css.
 */

export const THEME_STORAGE_KEY = "tal-theme";

type ThemeId = "or" | "marine" | "emeraude";

const themes: Array<{
  id: ThemeId;
  label: string;
  hint: string;
  /** Aperçu : masse principale, aplat clair, accentuation. */
  swatch: [string, string, string];
}> = [
  {
    id: "or",
    label: "Or & ambre",
    hint: "Luxe, justice, excellence",
    swatch: ["#b06f12", "#ecdcb4", "#d97706"],
  },
  {
    id: "marine",
    label: "Marine & crème",
    hint: "Autorité, prestige, sobriété",
    swatch: ["#0f2b4f", "#e8dcc4", "#b59a66"],
  },
  {
    id: "emeraude",
    label: "Émeraude",
    hint: "Accessibilité, renouveau",
    swatch: ["#2f9e44", "#c6e4ab", "#22c55e"],
  },
];

/* --------------------------------------------------------------------------
   Le thème vit sur <html data-theme>, hors de React. On le lit et on l'écrit
   via un petit store externe : c'est la façon prévue de synchroniser React
   avec une API de la plateforme, et cela évite tout décalage d'hydratation.
   -------------------------------------------------------------------------- */

let listeners: Array<() => void> = [];
let snapshot: ThemeId | null = null;

function subscribe(onChange: () => void) {
  listeners = [...listeners, onChange];
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function getSnapshot(): ThemeId {
  if (!snapshot) {
    snapshot = (document.documentElement.dataset.theme as ThemeId) || "or";
  }
  return snapshot;
}

/** Le serveur ne connaît pas le choix de l'utilisateur : thème par défaut. */
function getServerSnapshot(): ThemeId {
  return "or";
}

function setTheme(id: ThemeId) {
  snapshot = id;
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Navigation privée : le thème ne survivra pas au rechargement.
  }
  for (const listener of listeners) listener();
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="fixed right-5 bottom-24 z-50 flex flex-col items-end gap-3 lg:bottom-6">
      {open && (
        <div className="animate-fade-up w-64 rounded-2xl border border-marine-950/10 bg-white/95 p-3 shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 px-1 pb-2">
            <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-500 uppercase">
              Thème
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le sélecteur de thème"
              className="grid size-6 place-items-center rounded-full text-marine-400 transition-colors hover:bg-marine-50 hover:text-marine-900"
            >
              <IconClose className="size-3.5" />
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {themes.map((theme) => {
              const selected = theme.id === active;
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => setTheme(theme.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                      selected ? "bg-marine-50" : "hover:bg-marine-50/60",
                    )}
                  >
                    <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                      {theme.swatch.map((color) => (
                        <span
                          key={color}
                          className="size-5 rounded-full ring-2 ring-white"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-marine-950">
                        {theme.label}
                      </span>
                      <span className="block truncate text-xs text-marine-500">
                        {theme.hint}
                      </span>
                    </span>

                    {selected && <IconCheck className="size-4 shrink-0 text-trust-600" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 px-1 text-[0.65rem]/relaxed text-marine-400">
            Outil de comparaison temporaire.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Changer de thème"
        className="grid size-12 place-items-center rounded-full border border-marine-950/10 bg-white text-marine-800 shadow-card transition-transform hover:-translate-y-0.5"
      >
        <IconPalette className="size-5" />
      </button>
    </div>
  );
}
