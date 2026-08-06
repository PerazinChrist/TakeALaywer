/**
 * POST /api/besoins — dépôt d'un problème, public ou adressé à un cabinet.
 *
 * Le formulaire est le même dans les deux cas ; c'est le champ `scope` du corps
 * qui décide de sa destination. Un compte citoyen est exigé : c'est ce qui
 * permet de prévenir l'auteur quand on lui répond, et ce qui rend l'espace
 * communautaire modérable.
 */

import { relayCommunity } from "@/lib/api/community-relay";

export async function POST(request: Request) {
  return relayCommunity("/needs", request, "client");
}
