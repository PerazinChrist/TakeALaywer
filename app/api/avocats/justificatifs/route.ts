/**
 * POST /api/avocats/justificatifs
 *
 * Relaie une pièce justificative vers WordPress, qui la range dans son dossier
 * privé. Le fichier ne transite jamais par la médiathèque et n'est accessible
 * que depuis l'administration, par une URL signée.
 *
 * Attend un corps multipart avec deux champs : `type` (identifiant de la pièce)
 * et `file`.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readSessionToken } from "@/lib/api/session";

/** Aligné sur TAL_Private_Uploads::MAX_SIZE — 8 Mio. */
const MAX_SIZE = 8 * 1024 * 1024;

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const token = await readSessionToken();

  if (!token) {
    return NextResponse.json(
      { message: "Votre session a expiré. Reconnectez-vous pour déposer vos pièces.", errors: {} },
      { status: 401 },
    );
  }

  let incoming: FormData;

  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const type = incoming.get("type");
  const file = incoming.get("file");

  if (typeof type !== "string" || type === "") {
    return NextResponse.json(
      { message: "Type de justificatif manquant.", errors: {} },
      { status: 422 },
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Aucun fichier reçu.", errors: {} }, { status: 422 });
  }

  // Contrôles rejoués ici pour éviter un aller-retour inutile : WordPress
  // refuserait de toute façon, mais après avoir transféré tout le fichier.
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { message: "Fichier trop volumineux (8 Mo maximum).", errors: {} },
      { status: 413 },
    );
  }

  if (file.type && !ACCEPTED.includes(file.type)) {
    return NextResponse.json(
      { message: "Format non accepté. Déposez un PDF, un JPG, un PNG ou un WebP.", errors: {} },
      { status: 415 },
    );
  }

  const outgoing = new FormData();
  outgoing.set("type", type);
  outgoing.set("file", file, file.name);

  const result = await callWordPress("/me/documents", {
    method: "POST",
    formData: outgoing,
    token,
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
