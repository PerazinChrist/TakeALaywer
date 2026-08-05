/**
 * Sessions du site, portées par des cookies httpOnly.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Le jeton n'est délibérément pas rangé dans `localStorage` : un cookie
 * httpOnly reste illisible pour le JavaScript de la page, donc inexploitable
 * par une injection de script. Le navigateur n'a jamais le jeton entre les
 * mains, il l'envoie sans le voir.
 *
 * Deux cookies distincts, un par population : un avocat et un citoyen peuvent
 * être connectés en même temps dans le même navigateur — c'est même le cas de
 * l'équipe pendant les tests — et un cookie unique ferait de la dernière
 * connexion la seule valable. Surtout, le backend résout chaque jeton dans sa
 * propre table : présenter l'un là où l'autre est attendu n'ouvre rien.
 */

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "tal_session";

/** Session citoyenne — espace personnel et bibliothèque de guides. */
export const CLIENT_SESSION_COOKIE = "tal_client_session";

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
 * Lit le jeton de session citoyenne de la requête courante.
 *
 * @returns Le jeton, ou null si le citoyen n'est pas connecté.
 */
export async function readClientToken(): Promise<string | null> {
  const store = await cookies();

  return store.get(CLIENT_SESSION_COOKIE)?.value ?? null;
}

/**
 * Dépose le jeton dans la réponse.
 *
 * @param response  Réponse du Route Handler.
 * @param token     Jeton renvoyé par /auth/login ou /auth/register.
 * @param expiresAt Échéance MySQL en UTC (« 2026-08-09 12:34:56 »).
 */
export function writeSession(response: NextResponse, token: string, expiresAt?: string) {
  setCookie(response, SESSION_COOKIE, token, maxAgeFrom(expiresAt));
}

/** Retire le cookie de session. */
export function clearSession(response: NextResponse) {
  setCookie(response, SESSION_COOKIE, "", 0);
}

/**
 * Dépose le jeton citoyen dans la réponse.
 *
 * @param response  Réponse du Route Handler.
 * @param token     Jeton renvoyé par /client/login ou /client/register.
 * @param expiresAt Échéance MySQL en UTC.
 */
export function writeClientSession(
  response: NextResponse,
  token: string,
  expiresAt?: string,
) {
  setCookie(response, CLIENT_SESSION_COOKIE, token, maxAgeFrom(expiresAt));
}

/** Retire le cookie de session citoyenne. */
export function clearClientSession(response: NextResponse) {
  setCookie(response, CLIENT_SESSION_COOKIE, "", 0);
}

/** Écriture commune : mêmes garanties pour les deux cookies. */
function setCookie(response: NextResponse, name: string, value: string, maxAge: number) {
  response.cookies.set({
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    // En développement, le site tourne en http://localhost : exiger `secure`
    // empêcherait le cookie d'être posé et la connexion échouerait en silence.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
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
