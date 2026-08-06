/**
 * PATCH /api/avocats/rendez-vous/{id} — le cabinet répond à une demande.
 *
 * Confirmer, décliner, annuler ou marquer comme honoré : quatre transitions
 * d'un même objet, donc un seul verbe. Le plugin vérifie que la demande
 * appartient bien au compte porteur du jeton.
 */

import { NextResponse } from "next/server";
import { relayJson } from "@/lib/api/relay";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Demande introuvable.", errors: {} }, { status: 404 });
  }

  return relayJson(`/me/bookings/${id}`, "PATCH", request);
}
