import type { Metadata } from "next";
import { SITE_LOCALE, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

/**
 * Métadonnées d'une page publique, Open Graph compris.
 *
 * Sans Open Graph propre, une page hérite de celui du layout : **tout partage
 * affiche alors le titre et l'adresse de l'accueil**. Sur ce marché, le premier
 * canal de diffusion d'un lien juridique est WhatsApp, qui ne montre rien
 * d'autre que cet aperçu — un guide partagé se présentait donc comme la page
 * d'accueil, sans rapport avec ce qu'on venait de recommander.
 *
 * L'oubli était systématique parce que rien ne le signalait : une page sans
 * Open Graph ne casse rien, elle ment discrètement. D'où cette fabrique — on
 * ne peut plus déclarer un titre sans déclarer l'aperçu qui va avec.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  authors,
  noIndex = false,
}: {
  /** Titre de la page, sans le nom de marque : le gabarit du layout l'ajoute. */
  title: string;
  description: string;
  /** Chemin absolu depuis la racine, par exemple « /guides ». */
  path: string;
  type?: "website" | "article";
  /** Article uniquement : date de publication, au format ISO. */
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    ...(authors ? { authors: authors.map((name) => ({ name })) } : {}),
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      // Le titre Open Graph porte la marque, lui : il s'affiche seul dans une
      // conversation, hors du contexte d'un onglet de navigateur.
      title: `${title} — ${SITE_NAME}`,
      description,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  };
}
