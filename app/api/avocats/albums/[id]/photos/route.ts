/**
 * POST /api/avocats/albums/{id}/photos
 *
 * Ajoute une ou plusieurs images à un album. Le champ `file` peut être répété :
 * le praticien sélectionne son lot d'un coup dans l'explorateur de fichiers.
 */

import { IMAGE_RULE, relayForm } from "@/lib/api/relay";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const id = encodeURIComponent((await params).id);

  return relayForm(`/me/albums/${id}/photos`, request, {
    files: { file: IMAGE_RULE },
    fields: ["caption", "tone"],
  });
}
