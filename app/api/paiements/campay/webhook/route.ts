/**
 * Rappel serveur de CamPay — l'URL à déclarer dans « Callback URL » sur le
 * tableau de bord de l'application.
 *
 * CamPay la notifie dès qu'une transaction devient SUCCESSFUL ou FAILED, sans
 * attendre que le navigateur du citoyen soit encore ouvert. Le tableau de bord
 * laisse choisir GET ou POST : les deux verbes sont acceptés ici, parce qu'une
 * intégration qui casse selon une case cochée ailleurs est une intégration
 * fragile.
 *
 * ## Ce que cette route fait, et ce qu'elle ne fait pas
 *
 * Elle authentifie et journalise. Elle **n'ouvre pas** le guide, et c'est
 * volontaire : le déblocage s'écrit dans la bibliothèque d'un citoyen, or
 * WordPress identifie ce citoyen par son jeton de session — que CamPay n'a pas
 * et ne doit jamais avoir. L'ouverture reste donc le fait de
 * `/api/paiements/campay/statut`, appelé depuis la page de paiement, qui
 * interroge CamPay avant d'écrire quoi que ce soit.
 *
 * Conséquence assumée : un citoyen qui ferme son onglet juste après avoir tapé
 * son code verra son guide s'ouvrir à sa prochaine visite de la page de
 * paiement, pas à la seconde près. Le paiement, lui, n'est jamais perdu — la
 * référence reste vérifiable auprès de CamPay.
 *
 * Le jour où le plugin exposera un déblocage authentifié par clé d'API plutôt
 * que par session, c'est ici qu'il se branchera : les données validées
 * ci-dessous suffisent déjà.
 */

import { NextResponse } from "next/server";
import { verifyCallbackSignature } from "@/lib/paiement/campay";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return handle(Object.fromEntries(url.searchParams.entries()));
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  return handle(isRecord(payload) ? payload : {});
}

/* -------------------------------------------------------------------------- */

function handle(data: Record<string, unknown>): NextResponse {
  const signature = typeof data.signature === "string" ? data.signature : "";

  // Cette URL est publique : c'est CamPay qui l'appelle depuis l'extérieur.
  // Sans vérification de signature, n'importe qui pourrait la visiter en
  // annonçant « SUCCESSFUL » et se faire créditer un paiement fictif.
  if (!signature || !verifyCallbackSignature(signature)) {
    console.warn("[campay] rappel rejeté : signature absente ou invalide");

    // 403 plutôt que 400 : CamPay distingue les deux dans ses relances, et un
    // « mauvaise requête » lui ferait croire à un corps mal formé.
    return NextResponse.json({ received: false }, { status: 403 });
  }

  const status = typeof data.status === "string" ? data.status : "";
  const reference = typeof data.reference === "string" ? data.reference : "";
  const endpoint = typeof data.endpoint === "string" ? data.endpoint : "";

  console.info(
    `[campay] rappel authentifié — ${endpoint || "?"} ${status || "?"} ` +
      `réf. ${reference || "?"} ` +
      `montant ${String(data.amount ?? "?")} ${String(data.currency ?? "")}` +
      (status === "FAILED" && data.reason ? ` — motif : ${String(data.reason)}` : ""),
  );

  // Toujours 200 sur un rappel authentifié, y compris pour un échec de
  // paiement : le code de retour dit à CamPay « message reçu », pas
  // « transaction réussie ». Répondre en erreur déclencherait des relances
  // inutiles pour une information que nous avons déjà enregistrée.
  return NextResponse.json({ received: true }, { status: 200 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
