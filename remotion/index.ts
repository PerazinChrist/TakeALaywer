/**
 * Point d'entree du bundle Remotion.
 *
 * Ce fichier n'est jamais importe par l'application Next : c'est le CLI
 * (`npx remotion studio|render remotion/index.ts`) qui le charge. Les deux
 * bundles cohabitent dans le meme depot sans se croiser — rien de ce dossier
 * ne part dans le build du site.
 */
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
