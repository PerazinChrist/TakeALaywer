/**
 * DELETE /api/avocats/guides/{id}/fichier
 *
 * Retire le PDF sans supprimer le guide : le praticien remplace un fichier
 * obsolète ou bascule vers une rédaction en ligne sans tout ressaisir.
 */

import { relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  return relayJson(`/me/guides/${encodeURIComponent((await params).id)}/file`, "DELETE");
}
