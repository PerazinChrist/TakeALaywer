/**
 * PATCH /api/compte/profil
 *
 * Met à jour le profil citoyen. Seuls les champs envoyés sont modifiés ; le
 * plugin ignore tout ce qui n'est pas dans sa liste blanche.
 */

import { relayClientJson } from "@/lib/api/citizen-relay";

export async function PATCH(request: Request) {
  return relayClientJson("/client/me", "PATCH", request);
}
