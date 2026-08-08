import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos d'avocats et illustrations d'articles (stockage S3 / R2 a venir).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
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
