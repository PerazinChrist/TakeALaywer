import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergement, propriété intellectuelle et responsabilité de la plateforme TakeALawyer.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Institutionnel"
      title="Mentions légales"
      intro="Qui édite ce site, qui l’héberge, et ce que la plateforme engage — ou n’engage pas."
      updatedAt="3 août 2026"
      // Façade de palais de justice : l'institution, pour la page qui dit qui
      // édite le site et à quoi il s'engage. Le cadrage bas écarte le ciel, où
      // le sur-titre passerait mal.
      image="/headers/avocats.webp"
      imagePosition="center 70%"
      sections={[
        {
          id: "editeur",
          title: "Éditeur du site",
          body: (
            <>
              <p>
                Le présent site est édité par TakeALawyer, plateforme de mise en
                relation entre citoyens et avocats inscrits au Barreau.
              </p>
              <ul>
                <li>Dénomination sociale : à compléter avant l’ouverture au public</li>
                <li>Forme juridique et capital social : à compléter</li>
                <li>Numéro RCCM et numéro de contribuable : à compléter</li>
                <li>Siège social : à compléter</li>
                <li>Directeur de la publication : à compléter</li>
                <li>
                  Contact : par le <Link href="/contact">formulaire de contact</Link>
                </li>
              </ul>
              <p>
                Ces mentions seront complétées dès l’immatriculation de la
                société éditrice. Les publier incomplètes est préférable à ne
                rien publier : le visiteur sait ainsi où en est le projet.
              </p>
            </>
          ),
        },
        {
          id: "hebergement",
          title: "Hébergement",
          body: (
            <p>
              Le site est hébergé sur une infrastructure d’hébergement web
              professionnelle. L’identité complète de l’hébergeur, son adresse et
              son numéro de téléphone seront précisés dans cette section avant la
              mise en production.
            </p>
          ),
        },
        {
          id: "nature",
          title: "Nature du service",
          body: (
            <>
              <p>
                <strong>
                  TakeALawyer n’est pas un cabinet d’avocats et ne délivre aucune
                  consultation juridique.
                </strong>{" "}
                La plateforme met en relation des citoyens avec des avocats
                inscrits au Barreau, seuls habilités à conseiller et représenter.
              </p>
              <p>
                Les guides publiés sur le site sont rédigés et signés par des
                avocats vérifiés. Ils présentent un cadre général et ne
                constituent pas une consultation adaptée à une situation
                particulière. Aucun guide ne remplace l’avis d’un professionnel
                saisi de votre dossier.
              </p>
              <p>
                La relation contractuelle qui naît d’une prise de contact lie le
                citoyen et l’avocat. La plateforme n’y est pas partie et
                n’intervient ni dans la conduite du dossier, ni dans la fixation
                des honoraires.
              </p>
            </>
          ),
        },
        {
          id: "verification",
          title: "Vérification des praticiens",
          body: (
            <>
              <p>
                Chaque compte d’avocat ou de cabinet est contrôlé avant
                publication de sa fiche. Sont exigés :
              </p>
              <ul>
                <li>l’attestation d’inscription au Barreau ;</li>
                <li>la carte professionnelle d’avocat ;</li>
                <li>une pièce d’identité en cours de validité ;</li>
                <li>
                  pour un cabinet : le registre de commerce et la pièce
                  d’identité du représentant légal.
                </li>
              </ul>
              <p>
                Une fiche est retirée de l’annuaire dès que le compte est
                suspendu ou que les conditions de vérification cessent d’être
                réunies. Ce contrôle porte sur la qualité d’avocat, non sur la
                qualité des prestations délivrées.
              </p>
            </>
          ),
        },
        {
          id: "propriete",
          title: "Propriété intellectuelle",
          body: (
            <>
              <p>
                La structure du site, sa charte graphique, ses textes
                institutionnels et son code source sont protégés. Toute
                reproduction, même partielle, sans autorisation écrite préalable
                est interdite.
              </p>
              <p>
                Les guides et modèles publiés restent la propriété de leurs
                auteurs. En les publiant, l’avocat concède à la plateforme le
                droit de les diffuser dans les conditions prévues aux{" "}
                <Link href="/cgu">conditions générales</Link>. Leur reproduction
                ou leur revente par un tiers est interdite.
              </p>
            </>
          ),
        },
        {
          id: "responsabilite",
          title: "Responsabilité",
          body: (
            <>
              <p>
                Les informations publiées sur les fiches des praticiens sont
                déclaratives : elles sont fournies par les avocats eux-mêmes et
                mises à jour sous leur responsabilité. La plateforme vérifie la
                qualité d’avocat, pas l’exactitude de chaque ligne d’une
                biographie.
              </p>
              <p>
                La plateforme ne garantit ni l’issue d’un dossier, ni le délai de
                réponse d’un praticien, ni la disponibilité ininterrompue du
                service. Elle met en œuvre les moyens raisonnables pour assurer
                la continuité de l’accès et la sécurité des échanges.
              </p>
            </>
          ),
        },
        {
          id: "liens",
          title: "Liens et signalement",
          body: (
            <>
              <p>
                Les liens sortants présents sur les fiches des praticiens
                pointent vers des sites que la plateforme n’édite pas et dont
                elle ne répond pas.
              </p>
              <p>
                Tout contenu manifestement illicite ou contraire aux règles de
                l’Ordre peut être signalé par le{" "}
                <Link href="/contact">formulaire de contact</Link>. Un
                signalement est examiné, et le contenu peut être retiré à titre
                conservatoire pendant l’examen.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
