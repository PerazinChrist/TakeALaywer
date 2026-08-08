import type { NextConfig } from "next";

/**
 * En-têtes de sécurité, appliqués à toutes les réponses.
 *
 * Posés ici et non dans un middleware : `headers()` est traité par la couche de
 * routage, sans invoquer de fonction serveur. Un middleware coûterait une
 * exécution supplémentaire sur chaque requête, y compris les fichiers statiques,
 * pour un résultat identique.
 *
 * Volontairement absent : `Strict-Transport-Security`, déjà posé par Vercel.
 * Le redéclarer ici masquerait un jour un changement de politique côté
 * hébergeur derrière une valeur figée dans le dépôt.
 */
const securityHeaders = [
  // Empêche le navigateur de deviner un type MIME : un fichier téléversé et
  // servi en texte ne doit jamais pouvoir s'exécuter comme du script.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Le site n'a aucune raison d'être encadré ailleurs. La clé compte surtout
  // pour les navigateurs anciens ; `frame-ancestors` ci-dessous la double.
  { key: "X-Frame-Options", value: "DENY" },

  // L'adresse complète d'une page n'est transmise qu'à nous-mêmes. Vers
  // l'extérieur, seule l'origine part — un chemin comme
  // /guides/divorce-garde-des-enfants en dit long sur qui le consulte.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Aucune de ces interfaces n'est utilisée. Les refuser explicitement évite
  // qu'un script tiers introduit plus tard puisse les réclamer en silence.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },

  /*
   * CSP. Deux tolérances, assumées et documentées :
   *
   * - `'unsafe-inline'` sur les scripts : Next injecte ses données
   *   d'hydratation dans des balises inline. Les remplacer par un nonce impose
   *   un rendu dynamique sur toutes les pages, ce qui annulerait précisément le
   *   cache que l'on vient de mettre en place.
   * - `'unsafe-inline'` sur les styles : Tailwind et les styles calculés en
   *   ligne (teintes de vitrine, largeurs d'aperçu) en dépendent.
   *
   * `img-src` accepte `data:` pour les aplats encodés, et `https:` parce que
   * les visuels des praticiens sont servis par le WordPress, sur un domaine qui
   * peut changer. `frame-ancestors 'none'` est la version moderne et
   * contraignante de X-Frame-Options.
   */
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Retire `X-Powered-By: Next.js`. Annoncer sa pile et sa version ne sert
  // qu'à celui qui cherche une faille connue.
  poweredByHeader: false,

  images: {
    // Photos d'avocats et illustrations d'articles (stockage S3 / R2 a venir).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      {
        /*
         * `/accueil-epure` était la maquette de comparaison ; elle est devenue
         * la page d'accueil. La redirection permanente évite un 404 aux liens
         * partagés pendant l'arbitrage, et dit aux moteurs que l'adresse a
         * définitivement fusionné avec « / » plutôt que d'avoir disparu.
         */
        source: "/accueil-epure",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
