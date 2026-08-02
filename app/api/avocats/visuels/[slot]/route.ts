/**
 * POST | DELETE /api/avocats/visuels/{avatar|couverture}
 *
 * Dépose ou retire la photo de profil et la photo de couverture. Ces deux
 * visuels sont publics : ils passent par la médiathèque WordPress, contrairement
 * aux justificatifs.
 */

import { NextResponse } from "next/server";
import { IMAGE_RULE, relayForm, relayJson } from "@/lib/api/relay";

type Params = { params: Promise<{ slot: string }> };

/** L'URL parle français, le plugin parle son propre vocabulaire. */
const SLOTS: Record<string, string> = {
  avatar: "avatar",
  couverture: "cover",
};

export async function POST(request: Request, { params }: Params) {
  const slot = SLOTS[(await params).slot];

  if (!slot) return unknownSlot();

  return relayForm(`/me/visuals/${slot}`, request, { files: { file: IMAGE_RULE } });
}

export async function DELETE(_request: Request, { params }: Params) {
  const slot = SLOTS[(await params).slot];

  if (!slot) return unknownSlot();

  return relayJson(`/me/visuals/${slot}`, "DELETE");
}

function unknownSlot() {
  return NextResponse.json({ message: "Visuel inconnu.", errors: {} }, { status: 404 });
}
