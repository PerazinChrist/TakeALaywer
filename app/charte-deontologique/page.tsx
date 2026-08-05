import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Charte déontologique",
  description:
    "Les règles que la plateforme s’impose et impose aux avocats référencés : secret professionnel, interdiction du démarchage, modération des avis.",
  alternates: { canonical: "/charte-deontologique" },
};

export default function CharteDeontologiquePage() {
  return (
    <LegalPage
      eyebrow="Institutionnel"
      // Rayonnages d'ouvrages : le corpus de règles. La photographie est déjà
      // sombre, un voile uniforme y ferait disparaître les tranches.
      image="/headers/guides.webp"
      imagePosition="center 30%"
      imageVeil={0}
      title="Charte déontologique"
      intro="Une plateforme qui référence des avocats doit se plier aux règles de leur profession. Voici celles que nous nous imposons, et ce que nous exigeons des praticiens référencés."
      updatedAt="3 août 2026"
      sections={[
        {
          id: "principe",
          title: "Le principe qui gouverne tout le reste",
          body: (
            <>
              <p>
                La déontologie de l’avocat prime sur le fonctionnement de la
                plateforme. Chaque fois qu’une fonctionnalité entre en conflit
                avec une règle de l’Ordre, c’est la fonctionnalité qui cède.
              </p>
              <p>
                Concrètement : aucune mécanique du site — classement, mise en
                avant, notation, relance automatique — ne doit conduire un avocat
                à manquer à ses obligations professionnelles.
              </p>
            </>
          ),
        },
        {
          id: "secret",
          title: "Secret professionnel",
          body: (
            <>
              <p>
                Le secret professionnel est absolu et ne souffre aucune exception
                sur la plateforme.
              </p>
              <ul>
                <li>
                  Un avocat ne peut jamais confirmer publiquement l’existence
                  d’un dossier, y compris en réponse à un avis qui le mentionne.
                </li>
                <li>
                  Les réponses publiques aux avis sont modérées : celles qui
                  révèlent un élément de dossier sont refusées.
                </li>
                <li>
                  Le contenu des échanges entre un citoyen et un avocat n’est
                  jamais exploité à des fins commerciales ni utilisé pour
                  entraîner un quelconque modèle.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "anonymat",
          title: "Anonymat du citoyen",
          body: (
            <>
              <p>
                Un citoyen dépose son besoin sous pseudonyme. Son identité
                réelle n’est transmise à aucun avocat avant son accord explicite
                et révocable.
              </p>
              <p>
                Cette règle vaut aussi pour les avis : un avis est signé d’un
                prénom et d’une initiale, jamais d’un nom complet, et l’adresse
                e-mail du déposant n’est ni affichée ni communiquée au
                praticien.
              </p>
            </>
          ),
        },
        {
          id: "demarchage",
          title: "Interdiction du démarchage",
          body: (
            <>
              <p>
                La sollicitation personnalisée d’un client potentiel est
                encadrée. La plateforme ne permet pas à un avocat de contacter
                spontanément un citoyen : c’est toujours le citoyen qui dépose un
                besoin, et l’avocat qui y répond.
              </p>
              <p>
                Sont également proscrits sur les fiches et dans les guides :
              </p>
              <ul>
                <li>
                  la publicité comparative — aucune mention du type « meilleur
                  que », « plus efficace que » ;
                </li>
                <li>
                  toute promesse de résultat, explicite ou suggérée, y compris
                  sous forme de taux de réussite ;
                </li>
                <li>les témoignages sollicités ou rémunérés ;</li>
                <li>
                  la mention d’une spécialisation non reconnue par l’Ordre.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "honoraires",
          title: "Transparence des honoraires",
          body: (
            <>
              <p>
                Les honoraires indicatifs affichés sur une fiche engagent le
                praticien à en informer le client avant l’ouverture d’un dossier.
                Ils ne constituent pas un tarif ferme : le montant définitif est
                fixé dans la convention d’honoraires signée entre l’avocat et son
                client.
              </p>
              <p>
                Un praticien dont les honoraires pratiqués s’écartent
                systématiquement de ses honoraires affichés s’expose au retrait
                de sa fiche.
              </p>
            </>
          ),
        },
        {
          id: "avis",
          title: "Avis et notation",
          body: (
            <>
              <p>
                Le système d’avis est conçu pour informer, pas pour classer les
                avocats les uns contre les autres.
              </p>
              <ul>
                <li>
                  Un avis n’est publié qu’après modération, et jamais
                  automatiquement.
                </li>
                <li>
                  Un avis rattaché à un compte citoyen est signalé « certifié ».
                  Les autres sont publiés sans ce marquage.
                </li>
                <li>
                  Un avocat ne peut ni supprimer un avis, ni en obtenir le
                  retrait au motif qu’il est négatif. Il dispose d’un droit de
                  réponse publique.
                </li>
                <li>
                  Un avis diffamatoire, injurieux, ou révélant un élément de
                  dossier est retiré.
                </li>
                <li>
                  Aucun avis ne peut être acheté, sollicité contre avantage, ni
                  déposé par le praticien lui-même.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "contenus",
          title: "Contenus publiés",
          body: (
            <>
              <p>
                Les guides et modèles sont soumis à modération avant publication.
                Chaque document doit porter le nom de son auteur et rappeler
                qu’il ne remplace pas une consultation.
              </p>
              <p>
                Un modèle d’acte est fourni à titre pédagogique : le publier
                n’engage pas son auteur sur l’usage qu’un lecteur en fera dans sa
                propre situation, et le document le mentionne.
              </p>
            </>
          ),
        },
        {
          id: "signalement",
          title: "Signalement d’un manquement",
          body: (
            <p>
              Tout manquement constaté — par un citoyen, un confrère ou l’Ordre —
              peut être signalé par le{" "}
              <Link href="/contact">formulaire de contact</Link>. Le compte visé
              peut être suspendu à titre conservatoire pendant l’examen, ce qui
              retire immédiatement sa fiche de l’annuaire. Les décisions sont
              motivées et notifiées à l’intéressé.
            </p>
          ),
        },
      ]}
    />
  );
}
