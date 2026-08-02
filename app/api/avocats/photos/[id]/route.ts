/**
 * PATCH | DELETE /api/avocats/photos/{id}
 *
 * PATCH accepte deux formes : du JSON pour la seule légende, ou un multipart
 * lorsque l'image elle-même est remplacée.
 */

import { IMAGE_RULE, relayForm, relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const id = encodeURIComponent((await params).id);
  const path = `/me/photos/${id}`;

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    return relayForm(path, request, {
      files: { file: IMAGE_RULE },
      fields: ["caption", "tone"],
    });
  }

  return relayJson(path, "PATCH", request);
}

export async function DELETE(_request: Request, { params }: Params) {
  return relayJson(`/me/photos/${encodeURIComponent((await params).id)}`, "DELETE");
}
