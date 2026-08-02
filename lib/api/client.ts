/**
 * Client navigateur des Route Handlers de `app/api/avocats/`.
 *
 * Sûr côté client : il n'appelle jamais WordPress directement, seulement notre
 * propre origine. Le cookie de session part tout seul, et la clé d'API reste
 * dans le processus Next.
 */

import { API_ERROR_FALLBACK, type ApiEnvelope, type FieldErrors } from "@/lib/api/types";

/** Envoie un corps JSON. */
export async function postJson<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return sendJson<T>(path, "POST", body);
}

/** Modification partielle — le corps ne porte que les champs qui changent. */
export async function patchJson<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return sendJson<T>(path, "PATCH", body);
}

/** Suppression. Aucun corps : l'identifiant est dans le chemin. */
export async function del<T>(path: string): Promise<ApiEnvelope<T>> {
  return send<T>(path, { method: "DELETE" });
}

/** Envoie un corps multipart — justificatifs, images, PDF des guides. */
export async function postForm<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<ApiEnvelope<T>> {
  // Pas de Content-Type manuel : fetch doit poser lui-même la frontière.
  return send<T>(path, { method, body: formData });
}

function sendJson<T>(path: string, method: string, body: unknown): Promise<ApiEnvelope<T>> {
  return send<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function send<T>(path: string, init: RequestInit): Promise<ApiEnvelope<T>> {
  let response: Response;

  try {
    response = await fetch(path, { ...init, credentials: "same-origin" });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Connexion interrompue. Vérifiez votre réseau et réessayez.",
      errors: {},
      data: null,
    };
  }

  const payload = await readJson(response);
  const record = isRecord(payload) ? payload : {};

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      message: "",
      errors: {},
      data: payload as T,
    };
  }

  return {
    ok: false,
    status: response.status,
    message: typeof record.message === "string" ? record.message : API_ERROR_FALLBACK,
    errors: isRecord(record.errors) ? (record.errors as FieldErrors) : {},
    data: null,
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
