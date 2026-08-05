/**
 * GET /api/avocats/avis — les avis reçus par le praticien connecté.
 *
 * Renvoie aussi les avis non publiés : le praticien doit voir arriver un avis
 * en attente de modération, sans quoi il découvrirait sa publication.
 */

import { relayJson } from "@/lib/api/relay";

export async function GET() {
  return relayJson("/me/reviews", "GET");
}
