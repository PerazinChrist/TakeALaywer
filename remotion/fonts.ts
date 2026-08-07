/**
 * Chargement des deux polices de la marque : Playfair Display pour les titres
 * (solennite juridique) et Inter pour le corps (lisibilite), exactement comme
 * `app/layout.tsx`.
 *
 * Pourquoi `@remotion/google-fonts` plutot que `next/font` : au rendu, la
 * video est peinte par un Chrome headless qui n'execute pas Next. Sans
 * chargement explicite, le navigateur substitue une police systeme et le
 * fichier .mp4 sort avec une typographie qui n'est pas celle du site — un
 * defaut invisible dans le Studio (ou les polices sont deja en cache) et
 * visible seulement dans le rendu final.
 *
 * Le couple `delayRender` / `continueRender` bloque la capture de la premiere
 * image tant que les fichiers ne sont pas la : c'est ce qui garantit que la
 * frame 0 n'est pas rendue avec la police de repli.
 */
import { cancelRender, continueRender, delayRender } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const playfair = loadPlayfair("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

const handle = delayRender("Chargement des polices de marque");

Promise.all([inter.waitUntilDone(), playfair.waitUntilDone()])
  .then(() => continueRender(handle))
  .catch((error) => cancelRender(error));

/** Titres et chiffres mis en avant. */
export const FONT_SERIF = playfair.fontFamily;

/** Interface, corps de texte, etiquettes. */
export const FONT_SANS = inter.fontFamily;
