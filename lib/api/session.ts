/**
 * Session de l'avocat, portée par un cookie httpOnly.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Le jeton n'est délibérément pas rangé dans `localStorage` : un cookie
 * httpOnly reste illisible pour le JavaScript de la page, donc inexploitable
 * par une injection de script. Le navigateur n'a jamais le jeton entre les
 * mains, il l'envoie sans le voir.
 */

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "tal_session";

/** Repli si le plugin ne renvoie pas d'échéance exploitable : la durée du jeton. */
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Lit le jeton de session de la requête courante.
 *
 * @returns Le jeton, ou null si l'avocat n'est pas connecté.
 */
export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();

  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Dépose le jeton dans la réponse.
 *
 * @param response  Réponse du Route Handler.
 * @param token     Jeton renvoyé par /auth/login ou /auth/register.
 * @param expiresAt Échéance MySQL en UTC (« 2026-08-09 12:34:56 »).
 */
export function writeSession(response: NextResponse, token: string, expiresAt?: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    // En développement, le site tourne en http://localhost : exiger `secure`
    // empêcherait le cookie d'être posé et la connexion échouerait en silence.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeFrom(expiresAt),
  });
}

/** Retire le cookie de session. */
export function clearSession(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Convertit l'échéance MySQL du plugin en durée de vie du cookie.
 *
 * Le plugin renvoie une date UTC sans fuseau (« 2026-08-09 12:34:56 ») :
 * `Date.parse` l'interpréterait en heure locale, d'où le suffixe explicite.
 */
function maxAgeFrom(expiresAt?: string): number {
  if (!expiresAt) return DEFAULT_MAX_AGE;

  const timestamp = Date.parse(`${expiresAt.replace(" ", "T")}Z`);

  if (Number.isNaN(timestamp)) return DEFAULT_MAX_AGE;

  const seconds = Math.floor((timestamp - Date.now()) / 1000);

  return seconds > 60 ? seconds : DEFAULT_MAX_AGE;
}
