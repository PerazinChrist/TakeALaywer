"use client";

import { useEffect } from "react";

/**
 * Verrou de palette — OUTIL TEMPORAIRE, à retirer avec le sélecteur de thème.
 *
 * Cette maquette est spécifiée en or & ambre. Le sélecteur de thème de l'autre
 * page d'accueil écrit son choix dans `localStorage`, et le script anti-flash
 * de app/layout.tsx le réapplique à chaque chargement : sans ce verrou, la
 * variante s'afficherait en marine ou en émeraude selon la dernière
 * comparaison faite. Le thème précédent est restauré à la sortie de la page.
 */
export function GoldThemeLock() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;

    root.dataset.theme = "or";

    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  return null;
}
