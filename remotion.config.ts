/**
 * Configuration du CLI Remotion.
 *
 * Ce fichier n'est lu QUE par `npx remotion ...`. Next ne le voit pas : il
 * vit a la racine par convention du CLI, pas parce qu'il participe au build
 * du site.
 *
 * Documentation : https://www.remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

/**
 * Point d'entree par defaut : evite de repeter `remotion/index.ts` dans
 * chaque commande, et surtout evite qu'un script npm et une commande tapee a
 * la main pointent un jour vers deux entrees differentes.
 */
Config.setEntryPoint("remotion/index.ts");

/**
 * JPEG plutot que PNG pour les images intermediaires : le rendu est nettement
 * plus rapide et la difference est invisible une fois encode en H.264. A
 * repasser en "png" seulement si l'on ajoute un fond transparent (WebM).
 */
Config.setVideoImageFormat("jpeg");

/** Un rendu ecrase le precedent : on itere sur une pub, on ne l'archive pas. */
Config.setOverwriteOutput(true);

/**
 * Par defaut, le premier rendu telecharge « Chrome Headless Shell » (~170 Mo)
 * dans le cache de Remotion. Sur un poste qui a deja Chrome, c'est un
 * telechargement pour rien : il suffit de pointer l'executable existant.
 *
 *   Windows (PowerShell) :
 *     $env:REMOTION_BROWSER_EXECUTABLE = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
 *   macOS / Linux :
 *     export REMOTION_BROWSER_EXECUTABLE="/usr/bin/google-chrome"
 *
 * Variable non definie : Remotion reprend son comportement normal. Le chemin
 * n'est volontairement pas ecrit en dur ici — il change d'un poste a l'autre,
 * et un chemin fige casserait le rendu de tous les autres.
 */
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
