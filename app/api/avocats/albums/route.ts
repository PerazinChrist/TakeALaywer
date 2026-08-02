/**
 * POST /api/avocats/albums — crée un album photo.
 */

import { relayJson } from "@/lib/api/relay";

export async function POST(request: Request) {
  return relayJson("/me/albums", "POST", request);
}
