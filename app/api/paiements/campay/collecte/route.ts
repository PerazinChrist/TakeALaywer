/**
 * POST /api/paiements/campay/collecte — engager le paiement d'un guide.
 *
 * Première moitié du tunnel : on demande à CamPay d'inviter le citoyen à
 * valider le débit sur son téléphone. Rien n'est encore encaissé et rien n'est
 * débloqué — c'est `/api/paiements/campay/statut` qui constatera l'issue.
 *
 * Le montant n'est jamais lu dans le corps de la requête. Il est relu depuis le
 * récapitulatif servi par WordPress : un prix qui voyagerait par le navigateur
 * se négocierait depuis la console, et le guide à 5 000 FCFA partirait à 1.
 */

import { NextResponse } from "next/server";
import { collect, campayConfigured, currency, normalizePhone } from "@/lib/paiement/campay";
import { fetchCheckout, fetchCurrentClient } from "@/lib/api/citizen";
import { clientSessionExpired } from "@/lib/api/citizen-relay";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";
import type { CollectStart } from "@/lib/api/types";

export async function POST(request: Request) {
  if (!campayConfigured()) {
    return NextResponse.json(
      {
        message:
          "Le paiement mobile n’est pas configuré sur cette installation. " +
          "Aucun encaissement n’est possible pour l’instant.",
        errors: {},
      },
      { status: 503 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const body = (payload ?? {}) as { slug?: unknown; phone?: unknown; method?: unknown };
  const slug = typeof body.slug === "string" ? body.slug : "";
  const rawPhone = typeof body.phone === "string" ? body.phone : "";
  // Le moyen choisi sur la page ; il voyage jusqu'à la ligne d'achat pour que
  // le registre dise « MTN Mobile Money » plutôt qu'un « mobile_money » générique.
  const method = typeof body.method === "string" ? body.method : "";

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Guide inconnu.", errors: {} }, { status: 404 });
  }

  const phone = normalizePhone(rawPhone);

  if (!phone) {
    return NextResponse.json(
      {
        message: "Ce numéro ne semble pas valide.",
        errors: {
          phone: "Saisissez un numéro MTN ou Orange camerounais, par exemple 6 99 00 00 00.",
        },
      },
      { status: 422 },
    );
  }

  // Le compte porte l'achat : c'est lui qui gardera le guide accessible, et
  // c'est son identifiant qui rattachera la transaction CamPay à une personne.
  const session = await fetchCurrentClient();

  if (!session) return clientSessionExpired();

  const order = await fetchCheckout(slug);

  if (!order) {
    return NextResponse.json(
      { message: "Ce guide n’est plus disponible à la vente.", errors: {} },
      { status: 404 },
    );
  }

  if (order.owned) {
    return NextResponse.json(
      { message: "Ce guide est déjà dans votre bibliothèque.", errors: {} },
      { status: 409 },
    );
  }

  // Un guide gratuit passe par le déblocage direct : demander un débit de zéro
  // franc à un opérateur n'a pas de sens, et CamPay le refuserait (ER201).
  if (order.free || order.amount < 1) {
    return NextResponse.json(
      { message: "Ce guide est en lecture libre : aucun paiement n’est nécessaire.", errors: {} },
      { status: 409 },
    );
  }

  const result = await collect({
    amount: order.amount,
    phone,
    description: `Guide ${order.guide.title}`,
    // UUID neuf à chaque tentative. CamPay traite ce champ comme une clé
    // d'idempotence : le réutiliser renverrait la transaction précédente, donc
    // un échec resterait un échec et l'utilisateur ne pourrait pas réessayer.
    externalReference: crypto.randomUUID(),
    // Réutilisé à la vérification pour s'assurer que la transaction produite
    // appartient bien au compte qui réclame le déblocage.
    externalUser: session.client.id,
  });

  if (!result.ok) {
    const status = result.code === "ER101" || result.code === "ER102" ? 422 : 502;

    return NextResponse.json(
      {
        message: result.message,
        errors: status === 422 ? { phone: result.message } : {},
      },
      { status },
    );
  }

  // Consigner l'intention tout de suite, avant de savoir si elle aboutira.
  //
  // Sans cela, une demande refusée ou jamais validée ne laisse aucune trace :
  // le registre du back-office ne montrerait que les paiements réussis, et
  // personne ne pourrait rattraper une commande qui a échoué. La ligne naît
  // « en attente » et le guide reste fermé — c'est la vérification de statut,
  // ou une validation manuelle, qui la réglera.
  //
  // Écarté en mode simulé : le plugin y marque l'achat « payé » sur-le-champ,
  // ce qui ouvrirait le guide avant que quiconque ait tapé son code.
  if (!order.simulated) {
    const token = await readClientToken();

    if (token) {
      const opened = await callWordPress(`/client/guides/${slug}/unlock`, {
        method: "POST",
        token,
        body: { method: method || "mobile_money", reference: result.data.reference },
      });

      // Un échec ici ne doit pas annuler la demande : l'utilisateur a déjà la
      // sollicitation sur son téléphone. La vérification de statut rouvrira une
      // ligne si besoin — `unlock` est idempotent.
      if (!opened.ok) {
        console.warn(`[campay] intention non consignée pour ${slug} : ${opened.message}`);
      }
    }
  }

  const started: CollectStart = {
    reference: result.data.reference,
    ussdCode: result.data.ussd_code ?? "",
    operator: result.data.operator ?? "",
    amount: order.amount,
    currency: currency(),
    phone,
  };

  return NextResponse.json(started, { status: 200 });
}
