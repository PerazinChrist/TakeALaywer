/**
 * PATCH | DELETE /api/avocats/prestations/{id}
 *
 * L'appartenance de la prestation au compte connecté est vérifiée par le
 * plugin : un identifiant deviné répond 404, jamais 403 — répondre « interdit »
 * confirmerait que la prestation existe.
 */

import { relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return relayJson(`/me/prestations/${encodeURIComponent((await params).id)}`, "PATCH", request);
}

export async function DELETE(_request: Request, { params }: Params) {
  return relayJson(`/me/prestations/${encodeURIComponent((await params).id)}`, "DELETE");
}
