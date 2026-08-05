import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  metadataBase: new URL("https://takealawyer.com"),
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
    locale: "fr_FR",
    siteName: "TakeALawyer",
    title: "TakeALawyer — Trouvez le bon avocat en un clic",
    description:
      "7 000+ avocats répertoriés. Déposez votre besoin gratuitement et anonymement, recevez des réponses sous 24h.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TakeALawyer — Trouvez le bon avocat en un clic",
    description:
      "Déposez votre besoin juridique gratuitement et anonymement. Réponses d’avocats vérifiés sous 24h.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* TEMPORAIRE — `suppressHydrationWarning` : le script anti-flash plus bas pose
     `data-theme` sur <html> avant l'hydratation, donc l'attribut existe côté
     client sans figurer dans le HTML du serveur. Sans cette annonce, React tient
     l'écart pour une erreur d'hydratation, jette le HTML serveur et refait tout
     le rendu côté client — d'où l'avertissement sur le <script>. À supprimer
     avec le sélecteur de thème. */
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="bg-white font-sans text-marine-950">
        {/* TEMPORAIRE — applique le thème choisi avant le premier rendu pour
            éviter un flash. À supprimer avec le sélecteur. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('tal-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
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
