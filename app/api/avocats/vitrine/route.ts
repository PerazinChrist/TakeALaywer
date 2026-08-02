/**
 * PATCH /api/avocats/vitrine
 *
 * Modifie la vitrine publique : nom affiché, accroche, présentation, teinte de
 * couverture, domaines et langues.
 */

import { relayJson } from "@/lib/api/relay";

export async function PATCH(request: Request) {
  return relayJson("/me/profile", "PATCH", request);
}
