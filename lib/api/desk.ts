/**
 * Messagerie et notifications, côté serveur — les deux versants réunis.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Un citoyen et un praticien voient les mêmes écrans (une liste de fils, une
 * liste de notifications) alimentés par deux familles d'endpoints — `/client/*`
 * et `/me/*` — adossées à deux cookies distincts. Ce module tient la
 * correspondance une seule fois, pour que `/messages` et `/notifications`
 * n'existent qu'en un exemplaire.
 *
 * Les deux sessions peuvent être ouvertes en même temps dans le même navigateur
 * (c'est le cas de l'équipe pendant les tests, et de tout avocat qui a aussi un
 * compte citoyen). D'où `resolveViewer` : la page demande un versant, ce module
 * refuse celui dont le cookie n'existe pas, et retombe sur l'autre.
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { readClientToken, readSessionToken } from "@/lib/api/session";
import type {
  Conversation,
  ConversationThread,
  NotificationsResult,
} from "@/lib/api/types";

/** Le versant depuis lequel on regarde : citoyen ou praticien. */
export type Viewer = "client" | "account";

/** Compteurs de pastilles, par versant. */
export type Badges = {
  client: { notifications: number; messages: number } | null;
  account: { notifications: number; messages: number } | null;
};

/** Préfixe d'API et cookie correspondants à chaque versant. */
const ROUTES: Record<Viewer, { base: string; token: () => Promise<string | null> }> = {
  client: { base: "/client", token: readClientToken },
  account: { base: "/me", token: readSessionToken },
};

/**
 * Traduit le paramètre d'URL en versant interne.
 *
 * « citoyen » et « avocat » plutôt que « client » et « account » : les URL du
 * site sont en français et lisibles, la nomenclature du backend n'a pas à
 * remonter jusqu'à la barre d'adresse.
 */
export function viewerFromParam(value: string | undefined): Viewer | undefined {
  if (value === "avocat") return "account";
  if (value === "citoyen") return "client";

  return undefined;
}

/** Chemin inverse : le versant vers le paramètre d'URL. */
export function viewerToParam(viewer: Viewer): string {
  return viewer === "account" ? "avocat" : "citoyen";
}

/**
 * Versants réellement ouverts dans ce navigateur.
 *
 * Aucun appel réseau : la seule présence du cookie suffit à savoir quels
 * onglets proposer. Sa validité, elle, sera tranchée par le premier appel.
 */
export const openViewers = cache(async (): Promise<Viewer[]> => {
  const [client, account] = await Promise.all([readClientToken(), readSessionToken()]);

  const viewers: Viewer[] = [];

  // Le citoyen d'abord : c'est le versant que la majorité des visiteurs
  // possède, et celui vers lequel les liens de notification pointent le plus.
  if (client) viewers.push("client");
  if (account) viewers.push("account");

  return viewers;
});

/**
 * Choisit le versant à afficher.
 *
 * @param requested Versant demandé par l'URL, s'il y en a un.
 * @returns Le versant retenu, ou null si aucune session n'est ouverte.
 */
export async function resolveViewer(requested?: Viewer): Promise<Viewer | null> {
  const open = await openViewers();

  if (open.length === 0) return null;

  // Un versant demandé mais fermé n'est pas une erreur : c'est un lien partagé
  // ou un signet ouvert après déconnexion. On sert l'autre plutôt qu'un 404.
  if (requested && open.includes(requested)) return requested;

  return open[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Messagerie                                                                 */
/* -------------------------------------------------------------------------- */

/** Liste des fils du versant demandé. */
export async function fetchConversations(
  viewer: Viewer,
): Promise<{ items: Conversation[]; unread: number }> {
  const route = ROUTES[viewer];
  const token = await route.token();

  if (!token) return { items: [], unread: 0 };

  const response = await callWordPress<{ items: Conversation[]; unread: number }>(
    `${route.base}/conversations`,
    { token },
  );

  if (!response.ok || !response.data) return { items: [], unread: 0 };

  return {
    items: Array.isArray(response.data.items) ? response.data.items : [],
    unread: response.data.unread ?? 0,
  };
}

/**
 * Un fil et ses messages.
 *
 * ⚠️ Effet de bord assumé : le backend remet à zéro le compteur de non-lus du
 * lecteur. Ouvrir un fil vaut accusé de lecture — c'est ce qu'on attend d'une
 * messagerie, et cela évite un bouton « marquer comme lu » que personne ne
 * clique.
 */
export async function fetchThread(
  viewer: Viewer,
  uuid: string,
): Promise<ConversationThread | null> {
  const route = ROUTES[viewer];
  const token = await route.token();

  if (!token) return null;

  const response = await callWordPress<ConversationThread>(
    `${route.base}/conversations/${encodeURIComponent(uuid)}`,
    { token },
  );

  if (!response.ok || !response.data?.conversation) return null;

  return {
    conversation: response.data.conversation,
    messages: Array.isArray(response.data.messages) ? response.data.messages : [],
  };
}

/**
 * Cherche un fil dans les deux versants ouverts.
 *
 * Un lien de notification ne porte que l'identifiant du fil, pas le versant :
 * `/messages/{uuid}` doit s'ouvrir quel que soit le côté d'où on l'a reçu.
 */
export async function findThread(
  uuid: string,
  preferred?: Viewer,
): Promise<{ viewer: Viewer; thread: ConversationThread } | null> {
  const open = await openViewers();
  const order = preferred ? [preferred, ...open.filter((v) => v !== preferred)] : open;

  for (const viewer of order) {
    if (!open.includes(viewer)) continue;

    const thread = await fetchThread(viewer, uuid);

    if (thread) return { viewer, thread };
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

const NO_NOTIFICATIONS: NotificationsResult = { items: [], unread: 0 };

/** Notifications du versant demandé. */
export async function fetchNotifications(viewer: Viewer): Promise<NotificationsResult> {
  const route = ROUTES[viewer];
  const token = await route.token();

  if (!token) return NO_NOTIFICATIONS;

  const response = await callWordPress<NotificationsResult>(`${route.base}/notifications`, {
    token,
  });

  if (!response.ok || !response.data) return NO_NOTIFICATIONS;

  return {
    items: Array.isArray(response.data.items) ? response.data.items : [],
    unread: response.data.unread ?? 0,
  };
}

/**
 * Compteurs de l'en-tête, pour les deux versants à la fois.
 *
 * Mémoïsé : l'en-tête est rendu sur chaque page, et la barre d'action mobile le
 * demande aussi. Les deux lectures sont déjà faites par `fetchCurrentClient` et
 * `fetchCurrentAccount`, mais les rejouer ici les tiendrait deux fois — d'où le
 * recours aux compteurs légers plutôt qu'aux charges utiles complètes.
 */
export const fetchBadges = cache(async (): Promise<Badges> => {
  const [clientToken, accountToken] = await Promise.all([
    readClientToken(),
    readSessionToken(),
  ]);

  const [client, account] = await Promise.all([
    clientToken ? countsFor("client", clientToken) : null,
    accountToken ? countsFor("account", accountToken) : null,
  ]);

  return { client, account };
});

/** Deux compteurs pour un versant, en un aller-retour. */
async function countsFor(
  viewer: Viewer,
  token: string,
): Promise<{ notifications: number; messages: number } | null> {
  const response = await callWordPress<NotificationsResult>(
    `${ROUTES[viewer].base}/notifications?limit=1`,
    { token },
  );

  if (!response.ok || !response.data) return null;

  const conversations = await callWordPress<{ unread: number }>(
    `${ROUTES[viewer].base}/conversations`,
    { token },
  );

  return {
    notifications: response.data.unread ?? 0,
    messages: conversations.ok ? (conversations.data?.unread ?? 0) : 0,
  };
}
