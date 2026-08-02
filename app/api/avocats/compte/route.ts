/**
 * PATCH /api/avocats/compte
 *
 * Modifie les informations du compte — identité, exercice, coordonnées — pour
 * un avocat indépendant comme pour un cabinet. Le plugin rejoue la validation
 * et renvoie les erreurs par champ, que le formulaire rattache à ses entrées.
 */

import { relayJson } from "@/lib/api/relay";

export async function PATCH(request: Request) {
  return relayJson("/me/account", "PATCH", request);
}
