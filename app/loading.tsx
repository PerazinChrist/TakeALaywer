import { PageLoader } from "@/components/layout/page-loader";

/**
 * Écran d'attente de tout le site.
 *
 * Un `loading.tsx` place la page de son segment derrière une frontière
 * Suspense, et cette frontière couvre aussi les segments enfants qui n'ont pas
 * la leur. Posé à la racine, ce seul fichier sert donc toutes les pages —
 * inutile d'en répéter un par dossier.
 *
 * Ce n'est pas décoratif : chaque page du site est en `force-dynamic` et
 * interroge WordPress avant de rendre le premier octet. Sans cet écran, un
 * clic reste sans effet visible le temps de l'aller-retour, et le visiteur
 * clique une seconde fois.
 *
 * Les routes dont la mise en page s'écarte franchement de celle-ci — un espace
 * personnel, un formulaire — peuvent poser leur propre `loading.tsx` dans leur
 * dossier : Next.js retiendra le plus proche.
 */
export default function Loading() {
  return <PageLoader />;
}
