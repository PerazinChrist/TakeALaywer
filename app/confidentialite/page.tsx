import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Protection des données personnelles",
  description:
    "Quelles données TakeALawyer collecte, pourquoi, combien de temps elles sont conservées, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Institutionnel"
      image="/headers/guides.webp"
      imagePosition="center 30%"
      imageVeil={0}
      title="Protection des données personnelles"
      intro="Ce que nous collectons, pourquoi, combien de temps nous le gardons, et comment reprendre la main."
      updatedAt="3 août 2026"
      sections={[
        {
          id: "principe",
          title: "Notre principe : le minimum",
          body: (
            <>
              <p>
                Une donnée qui n’est pas collectée ne peut ni fuiter, ni être
                réclamée, ni être revendue. Nous ne demandons donc que ce dont le
                service a réellement besoin, et pas une ligne de plus.
              </p>
              <p>
                <strong>Nous ne vendons aucune donnée</strong> et ne la
                transmettons à aucun courtier publicitaire.
              </p>
            </>
          ),
        },
        {
          id: "citoyens",
          title: "Données des citoyens",
          body: (
            <>
              <p>
                Un compte citoyen repose sur un pseudonyme. C’est la seule
                identité visible d’un avocat tant que vous n’avez pas accepté de
                vous découvrir.
              </p>
              <ul>
                <li>
                  <strong>Pseudonyme</strong> — affiché sur vos avis et vos
                  demandes.
                </li>
                <li>
                  <strong>Adresse e-mail et téléphone</strong> — pour vous
                  notifier des réponses reçues et sécuriser le compte. Jamais
                  affichés.
                </li>
                <li>
                  <strong>Nom et prénom</strong> — facultatifs, communiqués à un
                  avocat seulement après votre accord explicite.
                </li>
                <li>
                  <strong>Ville</strong> — pour acheminer votre besoin vers des
                  praticiens du bon ressort.
                </li>
                <li>
                  <strong>Contenu de vos demandes et de vos avis.</strong>
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "praticiens",
          title: "Données des avocats et cabinets",
          body: (
            <>
              <p>
                Un compte praticien suppose une vérification, donc davantage de
                données. Les justificatifs déposés — attestation d’inscription au
                Barreau, carte professionnelle, pièce d’identité, registre de
                commerce — sont stockés hors du dossier public du site et ne sont
                jamais accessibles par une adresse devinable.
              </p>
              <p>
                Seule l’équipe de vérification y accède, et chaque consultation
                est journalisée. Ces pièces ne sont jamais publiées, ni
                transmises à un tiers en dehors d’une réquisition légale.
              </p>
              <p>
                Les informations de la fiche publique — biographie, domaines,
                honoraires indicatifs, coordonnées professionnelles — sont
                publiées par le praticien lui-même et destinées à l’être.
              </p>
            </>
          ),
        },
        {
          id: "techniques",
          title: "Données techniques",
          body: (
            <>
              <p>
                Nous enregistrons l’adresse IP à l’inscription et au dépôt d’un
                avis. Elle sert exclusivement à limiter les abus — cinq
                inscriptions et trois avis par heure — et à horodater les
                consentements.
              </p>
              <p>
                Les cookies déposés sont strictement nécessaires : cookie de
                session pour l’espace praticien, et préférence de thème. Aucun
                cookie publicitaire, aucun traceur tiers.
              </p>
            </>
          ),
        },
        {
          id: "duree",
          title: "Durées de conservation",
          body: (
            <>
              <ul>
                <li>
                  <strong>Compte actif</strong> — tant que le compte existe.
                </li>
                <li>
                  <strong>Compte fermé</strong> — suppression des données
                  personnelles sous trente jours, hors obligations légales de
                  conservation.
                </li>
                <li>
                  <strong>Justificatifs</strong> — supprimés à la fermeture du
                  compte, ou en cas de refus d’inscription.
                </li>
                <li>
                  <strong>Sessions</strong> — le jeton expire de lui-même ; seule
                  son empreinte est stockée, jamais le jeton lui-même.
                </li>
                <li>
                  <strong>Journal d’activité</strong> — conservé pour justifier
                  une décision de vérification ou de suspension.
                </li>
                <li>
                  <strong>Avis publiés</strong> — conservés et anonymisés à la
                  fermeture du compte de leur auteur : ils appartiennent à la
                  réputation du praticien concerné.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "securite",
          title: "Sécurité",
          body: (
            <>
              <ul>
                <li>
                  Les mots de passe sont hachés. Ils ne sont jamais stockés en
                  clair et ne peuvent pas être retrouvés — seulement
                  réinitialisés.
                </li>
                <li>
                  Les comptes praticiens sont indépendants du système
                  d’utilisateurs du moteur du site : un mot de passe d’avocat
                  n’ouvre aucune interface d’administration.
                </li>
                <li>
                  Les justificatifs sont servis par un contrôleur qui vérifie les
                  droits à chaque requête, jamais par une adresse publique.
                </li>
                <li>
                  Aucune donnée bancaire ne transite par nos serveurs : la saisie
                  a lieu chez le prestataire de paiement.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "droits",
          title: "Vos droits",
          body: (
            <>
              <p>Vous pouvez à tout moment demander :</p>
              <ul>
                <li>l’accès aux données vous concernant ;</li>
                <li>la rectification d’une donnée inexacte ;</li>
                <li>la suppression de votre compte et de vos données ;</li>
                <li>une copie exportable de vos données ;</li>
                <li>
                  la limitation d’un traitement, ou l’opposition à celui-ci.
                </li>
              </ul>
              <p>
                Ces demandes se font par le{" "}
                <Link href="/contact">formulaire de contact</Link>. Nous
                répondons sous trente jours. En l’absence de réponse
                satisfaisante, vous pouvez saisir l’autorité compétente en
                matière de protection des données.
              </p>
            </>
          ),
        },
        {
          id: "sous-traitants",
          title: "Sous-traitants",
          body: (
            <p>
              Nous faisons appel à des prestataires pour l’hébergement,
              l’acheminement des e-mails et SMS, et le traitement des paiements.
              Chacun n’accède qu’aux données nécessaires à sa mission et ne peut
              en faire aucun autre usage. La liste nominative sera publiée dans
              cette section avant l’ouverture au public.
            </p>
          ),
        },
      ]}
    />
  );
}
