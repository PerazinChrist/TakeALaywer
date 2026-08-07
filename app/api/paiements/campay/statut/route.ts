/**
 * POST /api/paiements/campay/statut — constater l'issue d'un paiement.
 *
 * Seconde moitié du tunnel, et le seul endroit qui ouvre un guide payant.
 *
 * Le navigateur n'apporte ici qu'une référence de transaction : tout le reste
 * est vérifié auprès de CamPay, qui est la seule autorité sur ce qui a été
 * encaissé. Quatre contrôles avant le déblocage — et ils ne sont pas
 * redondants, chacun ferme une porte différente :
 *
 *   • le statut vaut SUCCESSFUL, sinon rien n'a été payé ;
 *   • la transaction est un encaissement (« collect ») et non un retrait ;
 *   • elle appartient au compte connecté, sinon la référence d'un inconnu
 *     — visible dans ses propres appels réseau — débloquerait chez nous ;
 *   • le montant couvre le prix du guide, sinon un paiement de 5 FCFA fait
 *     pour un autre article ouvrirait le catalogue entier.
 *
 * C'est délibérément une méthode POST malgré son allure de lecture : l'appel
 * écrit dans la bibliothèque du citoyen quand le paiement a abouti.
 */

import { NextResponse } from "next/server";
import {
  transaction,
  campayConfigured,
  chargeFor,
  currency,
  withdraw,
} from "@/lib/paiement/campay";
import { fetchCheckout, fetchCurrentClient } from "@/lib/api/citizen";
import { clientSessionExpired } from "@/lib/api/citizen-relay";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";
import type { PaymentStatusResult, PayoutOrder, UnlockResult } from "@/lib/api/types";

/** UUID4 tel que CamPay les émet. Un identifiant hors format n'est pas relayé. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verse à l'auteur la part que le plugin vient d'arrêter — au fil de l'eau.
 *
 * Le virement part dans la foulée de la vente plutôt qu'en lot mensuel : c'est
 * le choix fait pour que l'auteur constate ses gains pendant qu'il se souvient
 * encore de la vente.
 *
 * Cette fonction ne lève jamais et ne fait jamais échouer l'appel qui l'englobe.
 * L'acheteur a payé et son guide est ouvert ; un virement qui échoue est une
 * affaire entre la plateforme et l'auteur, elle ne doit pas se manifester par
 * une erreur sur l'écran de quelqu'un qui n'y est pour rien. L'échec est
 * consigné, et l'écran « Reversements » du back-office permet de le relancer.
 */
async function settlePayout(payout: PayoutOrder | undefined, guideTitle: string) {
  if (!payout || payout.status !== "en_attente" || payout.amount <= 0) return;

  // Sans numéro, le reversement reste en attente avec son motif : la dette est
  // enregistrée, elle se réglera quand le praticien aura renseigné le sien.
  if (!payout.phone) return;

  const sent = await withdraw({
    amount: payout.amount,
    phone: payout.phone,
    description: `Vente ${guideTitle}`,
    externalReference: crypto.randomUUID(),
  });

  const result = sent.ok
    ? {
        status: "verse",
        reference: sent.data.reference,
        operator: "",
      }
    : {
        status: "echoue",
        reason: sent.message,
      };

  const recorded = await callWordPress(
    `/client/payouts/${encodeURIComponent(payout.id)}/result`,
    { method: "POST", withKey: true, body: result },
  );

  if (!recorded.ok) {
    // Le pire cas : l'argent est parti et le registre l'ignore. On le crie dans
    // les journaux avec la référence, seul moyen de rapprocher ensuite.
    console.error(
      `[campay] reversement ${payout.id} non consigné (${result.status}) : ${recorded.message}`,
    );
  }
}

export async function POST(request: Request) {
  if (!campayConfigured()) {
    return NextResponse.json(
      { message: "Le paiement mobile n’est pas configuré sur cette installation.", errors: {} },
      { status: 503 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const body = (payload ?? {}) as { slug?: unknown; reference?: unknown; method?: unknown };
  const slug = typeof body.slug === "string" ? body.slug : "";
  const reference = typeof body.reference === "string" ? body.reference : "";
  const method = typeof body.method === "string" ? body.method : "";

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Guide inconnu.", errors: {} }, { status: 404 });
  }

  if (!UUID.test(reference)) {
    return NextResponse.json({ message: "Référence de paiement invalide.", errors: {} }, { status: 400 });
  }

  const session = await fetchCurrentClient();

  if (!session) return clientSessionExpired();

  const order = await fetchCheckout(slug);

  if (!order) {
    return NextResponse.json({ message: "Ce guide n’est plus disponible.", errors: {} }, { status: 404 });
  }

  // Le rappel serveur de CamPay a pu confirmer l'achat avant que le navigateur
  // ne repose la question. Le guide est déjà ouvert : inutile de redébiter quoi
  // que ce soit, et surtout inutile de rejouer le déblocage.
  if (order.owned) {
    return NextResponse.json(
      { status: "SUCCESSFUL", unlocked: true, message: "Paiement confirmé." } satisfies PaymentStatusResult,
      { status: 200 },
    );
  }

  const result = await transaction(reference);

  if (!result.ok) {
    return NextResponse.json({ message: result.message, errors: {} }, { status: 502 });
  }

  const paid = result.data;

  if (paid.status === "PENDING") {
    return NextResponse.json(
      {
        status: "PENDING",
        unlocked: false,
        message:
          "Le paiement attend votre validation. Confirmez la demande reçue sur votre téléphone.",
      } satisfies PaymentStatusResult,
      { status: 200 },
    );
  }

  if (paid.status !== "SUCCESSFUL") {
    return NextResponse.json(
      {
        status: "FAILED",
        unlocked: false,
        message: paid.reason?.trim()
          ? `Paiement refusé : ${paid.reason.trim()}`
          : "Le paiement n’a pas abouti. Vous pouvez réessayer, rien n’a été débité.",
      } satisfies PaymentStatusResult,
      { status: 200 },
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Le paiement est abouti : reste à vérifier qu'il paie bien ceci, pour eux */
  /* ---------------------------------------------------------------------- */

  const mismatch =
    paid.endpoint !== "collect" ||
    paid.external_user !== session.client.id ||
    paid.currency !== currency() ||
    Number(paid.amount) < order.amount;

  if (mismatch) {
    // Message volontairement sobre : détailler lequel des quatre contrôles a
    // échoué apprendrait à un curieux comment fabriquer la prochaine tentative.
    return NextResponse.json(
      {
        message:
          "Ce paiement ne correspond pas à cette commande. Contactez-nous en " +
          "indiquant la référence, nous la vérifions à la main.",
        errors: {},
      },
      { status: 409 },
    );
  }

  const token = await readClientToken();

  if (!token) return clientSessionExpired();

  // Premier temps : ouvrir — ou retrouver — la ligne d'achat du citoyen. Hors
  // simulation, le plugin la crée « en attente » et laisse le guide fermé ;
  // c'est la confirmation ci-dessous qui la règle.
  let unlock = await callWordPress<UnlockResult>(`/client/guides/${slug}/unlock`, {
    method: "POST",
    token,
    body: {
      method: method || "mobile_money",
      // La référence CamPay part avec l'achat : c'est elle qui permettra de
      // rapprocher une ligne de la bibliothèque d'une transaction encaissée le
      // jour où quelqu'un conteste un débit.
      reference: paid.reference,
      operator: paid.operator,
      operator_reference: paid.operator_reference,
      amount: Math.round(Number(paid.amount)),
      currency: paid.currency,
    },
  });

  // Second temps : attester l'encaissement. Cet appel porte la clé d'API et non
  // le jeton citoyen — c'est nous qui affirmons avoir vérifié la transaction
  // auprès de CamPay, pas le navigateur de l'acheteur.
  //
  // Il n'a lieu que si le plugin n'a pas déjà ouvert le guide : en mode simulé
  // il le fait de lui-même, et reconfirmer une ligne déjà réglée n'apprendrait
  // rien à personne.
  if (unlock.ok && unlock.data?.unlocked === false) {
    // La commission de l'opérateur, relevée dans son historique. Elle sépare le
    // brut du net, et c'est sur le net que se calcule la part de l'auteur.
    const fee = await chargeFor(paid.reference);

    const confirmed = await callWordPress<UnlockResult & { payout?: PayoutOrder }>(
      "/client/purchases/confirm",
      {
        method: "POST",
        withKey: true,
        body: {
          client: session.client.id,
          guide: slug,
          reference: paid.code || paid.reference,
          method: method || "mobile_money",
          amount: Math.round(Number(paid.amount)),
          // Commission inconnue : on la déclare nulle plutôt que devinée. Le
          // reversement sera alors calculé sur le brut, donc légèrement
          // favorable à l'auteur — une erreur qui coûte des centimes, quand
          // l'inverse enverrait de l'argent qui n'est jamais entré.
          fee: fee ?? 0,
        },
      },
    );

    // Un échec de confirmation laisse la ligne « en attente » : le message plus
    // bas dira que l'argent est reçu et l'accès à ouvrir, ce qui est exact.
    if (confirmed.ok) {
      unlock = confirmed;
      await settlePayout(confirmed.data?.payout, order.guide.title);
    }
  }

  if (!unlock.ok) {
    // Cas le plus délicat du tunnel : l'argent est encaissé et le guide reste
    // fermé. On le dit franchement plutôt que d'afficher une erreur muette,
    // et la référence donne de quoi réparer.
    return NextResponse.json(
      {
        message:
          `${unlock.message} Votre paiement a bien été reçu (référence ${paid.code || paid.reference}). ` +
          "Signalez-nous cette référence : l’accès sera ouvert sans nouveau règlement.",
        errors: unlock.errors,
      },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      status: "SUCCESSFUL",
      unlocked: unlock.data?.unlocked ?? true,
      message: unlock.data?.message || "Paiement confirmé. Bonne lecture.",
      reference: paid.code || paid.reference,
    } satisfies PaymentStatusResult,
    { status: 200 },
  );
}
