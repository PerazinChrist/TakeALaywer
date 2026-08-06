/**
 * POST /api/notifications/lues — marque une notification, ou toutes.
 *
 * Un corps `{ id }` marque une entrée précise ; un corps vide vide la pastille
 * du versant demandé. Les deux passent par la même route : c'est la même
 * intention, à la granularité près.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readClientToken, readSessionToken } from "@/lib/api/session";

export async function POST(request: Request) {
  let body: { id?: string | number; viewer?: string } = {};

  try {
    body = (await request.json()) as { id?: string | number; viewer?: string };
  } catch {
    // « Tout marquer comme lu » n'envoie rien : un corps absent est légitime.
  }

  const practitioner = body.viewer === "avocat";
  const token = practitioner ? await readSessionToken() : await readClientToken();

  if (!token) {
    return NextResponse.json(
      { message: "Votre session a expiré. Reconnectez-vous pour poursuivre.", errors: {} },
      { status: 401 },
    );
  }

  const base = practitioner ? "/me" : "/client";

  const result = await callWordPress(`${base}/notifications/read`, {
    method: "POST",
    body: { id: Number(body.id ?? 0) || 0 },
    token,
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data as object, { status: result.status });
}
