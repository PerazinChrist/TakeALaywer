/**
 * PATCH | DELETE /api/avocats/albums/{id}
 *
 * La suppression emporte les photos de l'album et les fichiers correspondants
 * de la médiathèque : côté plugin, TAL_Albums::delete s'en charge.
 */

import { relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return relayJson(`/me/albums/${encodeURIComponent((await params).id)}`, "PATCH", request);
}

export async function DELETE(_request: Request, { params }: Params) {
  return relayJson(`/me/albums/${encodeURIComponent((await params).id)}`, "DELETE");
}
