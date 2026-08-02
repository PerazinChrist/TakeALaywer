/**
 * POST | DELETE /api/avocats/guides/{id}
 *
 * POST plutôt que PATCH pour la modification : un remplacement de PDF voyage en
 * multipart, que le serveur ne sait analyser que sur un POST. Le plugin accepte
 * les deux verbes sur cette route.
 */

import { GUIDE_FIELDS, IMAGE_RULE, PDF_RULE, relayForm, relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const id = encodeURIComponent((await params).id);

  return relayForm(`/me/guides/${id}`, request, {
    files: { file: PDF_RULE, cover: IMAGE_RULE },
    fields: GUIDE_FIELDS,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return relayJson(`/me/guides/${encodeURIComponent((await params).id)}`, "DELETE");
}
