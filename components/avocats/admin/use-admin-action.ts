"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiEnvelope, FieldErrors } from "@/lib/api/types";

/**
 * État commun à toutes les écritures de l'espace praticien.
 *
 * Chaque section — compte, vitrine, galerie, guides, prestations — fait la même
 * chose : envoyer, empêcher le double envoi, afficher l'erreur globale, rattacher
 * les erreurs de champ, confirmer brièvement le succès. Ce hook tient cette
 * mécanique pour qu'aucune section n'oublie l'un des quatre états.
 */
export function useAdminAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);

  // Le composant peut être démonté pendant la requête — changer d'onglet suffit.
  // Sans ce garde, React signalerait une mise à jour sur un arbre disparu.
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /**
   * Exécute une écriture et met l'état à jour.
   *
   * @param call    Appel réseau, qui retourne l'enveloppe normalisée.
   * @param onDone  Rappel joué avec la charge utile, en cas de succès.
   * @returns Vrai si l'écriture a abouti.
   */
  const run = useCallback(
    async <T,>(
      call: () => Promise<ApiEnvelope<T>>,
      onDone?: (data: T | null) => void,
    ): Promise<boolean> => {
      if (!alive.current) return false;

      setPending(true);
      setError("");
      setErrors({});
      setDone(false);

      const result = await call();

      if (!alive.current) return result.ok;

      setPending(false);

      if (!result.ok) {
        setError(result.message);
        setErrors(result.errors);
        return false;
      }

      onDone?.(result.data);
      setDone(true);

      // La confirmation s'efface d'elle-même : laissée en place, elle finirait
      // par décrire une action vieille de dix minutes.
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (alive.current) setDone(false);
      }, 4000);

      return true;
    },
    [],
  );

  /** Efface les messages — à appeler quand l'utilisateur reprend sa saisie. */
  const reset = useCallback(() => {
    setError("");
    setErrors({});
    setDone(false);
  }, []);

  return { run, reset, pending, error, errors, done };
}
