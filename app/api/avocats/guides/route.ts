/**
 * POST /api/avocats/guides — publie un guide ou un modèle d'acte.
 *
 * Deux formats coexistent : un PDF déposé (`file`), ou un contenu rédigé en
 * ligne (`content`, du HTML mis en forme). Le corps est donc toujours multipart,
 * même quand aucun fichier ne l'accompagne — cela évite deux chemins de code
 * pour une seule intention.
 */

import { GUIDE_FIELDS, IMAGE_RULE, PDF_RULE, relayForm } from "@/lib/api/relay";

export async function POST(request: Request) {
  return relayForm("/me/guides", request, {
    // `file` est le produit vendu ; `cover` la simple illustration de la fiche.
    files: { file: PDF_RULE, cover: IMAGE_RULE },
    fields: GUIDE_FIELDS,
  });
}
