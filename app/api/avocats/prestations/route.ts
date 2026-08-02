/**
 * POST /api/avocats/prestations — crée une prestation tarifée.
 */

import { relayJson } from "@/lib/api/relay";

export async function POST(request: Request) {
  return relayJson("/me/prestations", "POST", request);
}
