import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import "./globals.css";

/* Titres : police serif -> solennite juridique et haut de gamme. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/* Corps de texte & interface : sans-serif -> lisibilite mobile et modernite. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Une seule source pour l'adresse publique : les canoniques et les images
  // Open Graph déclarées en chemin relatif s'y adossent. Codée en dur, elle se
  // serait retrouvée à annoncer le domaine de production depuis une
  // préproduction — le meilleur moyen de faire désindexer le vrai site.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TakeALawyer — Trouvez le bon avocat en un clic",
    template: "%s | TakeALawyer",
  },
  description:
    "Posez votre besoin juridique gratuitement et anonymement, recevez des propositions d’avocats vérifiés sous 24h et accédez à des guides rédigés par des professionnels du droit.",
  keywords: [
    "avocat",
    "conseil juridique",
    "consultation juridique en ligne",
    "droit des affaires",
    "droit foncier",
    "droit de la famille",
    "annuaire avocats",
  ],
  authors: [{ name: "TakeALawyer" }],
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "TakeALawyer — Trouvez le bon avocat en un clic",
    description:
      "Avocats et cabinets vérifiés. Déposez votre besoin gratuitement et anonymement, recevez des réponses sous 24h.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TakeALawyer — Trouvez le bon avocat en un clic",
    description:
      "Déposez votre besoin juridique gratuitement et anonymement. Réponses d’avocats vérifiés sous 24h.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sans ces trois autorisations, Google se limite à un extrait court et
      // n'affiche aucune vignette : sur une requête juridique, l'aperçu long
      // est souvent ce qui décide du clic.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Le français est la seule langue servie aujourd'hui. La déclarer évite que
  // Google propose une version anglaise inexistante aux régions anglophones.
  alternates: { languages: { "fr-CM": "/" } },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
   * Le sélecteur de thème et son script anti-flash ont été retirés : la
   * colorimétrie est arrêtée sur « or & ambre », qui est la valeur par défaut
   * de :root dans globals.css. Les retirer était nécessaire, et pas seulement
   * cosmétique — le script relisait `localStorage`, si bien qu'un visiteur
   * ayant essayé la variante émeraude pendant la comparaison aurait vu tout le
   * site en vert, définitivement, sans plus aucun moyen d'en sortir.
   */
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-white font-sans text-marine-950">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-marine-950 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
