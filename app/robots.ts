import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * robots.txt.
 *
 * Les espaces personnels sont déjà en `noindex` dans leurs métadonnées, ce qui
 * suffit à les tenir hors de l'index. On les interdit ici en plus, pour une
 * raison différente : économiser le budget d'exploration. Un robot qui parcourt
 * la messagerie et les tunnels de paiement dépense sur des pages qui ne seront
 * jamais servies, au détriment des vitrines et des guides.
 *
 * Les deux mécanismes ne sont pas interchangeables — au contraire, ils se
 * gênent : une page interdite ici ne peut plus être lue, donc son `noindex` ne
 * peut plus être constaté. C'est pourquoi seules les pages déjà exclues de
 * longue date, et sans valeur de référencement, figurent dans `disallow`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/compte/",
          "/messages/",
          "/notifications/",
          "/avocats/espace-praticien",
          "/avocats/connexion",
          // Tunnels d'achat et de réservation : une page par guide et par
          // avocat, sans contenu propre, qui diluerait l'exploration.
          "/guides/*/acheter",
          "/avocats/*/rendez-vous",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
