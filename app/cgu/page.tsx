import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description:
    "Règles d’accès et d’usage de la plateforme TakeALawyer : comptes, dépôt de besoin, achat de guides, paiements et résiliation.",
  alternates: { canonical: "/cgu" },
};

export default function CguPage() {
  return (
    <LegalPage
      eyebrow="Institutionnel"
      // Même façade que les mentions légales : les deux documents disent la
      // règle contractuelle, et les rapprocher visuellement se lit comme tel.
      image="/headers/avocats.webp"
      imagePosition="center 70%"
      title="Conditions générales d’utilisation"
      intro="Ce que vous acceptez en utilisant la plateforme, et ce que la plateforme s’engage à faire en retour."
      updatedAt="3 août 2026"
      sections={[
        {
          id: "objet",
          title: "Objet",
          body: (
            <>
              <p>
                Les présentes conditions régissent l’accès et l’usage de la
                plateforme TakeALawyer, quel que soit le mode de connexion.
                Utiliser le site vaut acceptation.
              </p>
              <p>
                La plateforme fournit un service d’intermédiation : elle permet
                à un citoyen d’exposer un besoin juridique et à un avocat
                vérifié d’y répondre. Elle ne délivre aucune prestation
                juridique. Voir les{" "}
                <Link href="/mentions-legales">mentions légales</Link>.
              </p>
            </>
          ),
        },
        {
          id: "comptes",
          title: "Comptes",
          body: (
            <>
              <p>Deux catégories de comptes coexistent, aux règles distinctes.</p>
              <p>
                <strong>Compte citoyen.</strong> Création libre. Un pseudonyme
                est obligatoire : c’est la seule identité visible des avocats
                tant que vous n’avez pas accepté de vous découvrir.
              </p>
              <p>
                <strong>Compte avocat ou cabinet.</strong> Soumis à vérification
                préalable des justificatifs. La fiche publique n’est mise en
                ligne qu’après validation, et retirée dès suspension du compte.
              </p>
              <p>
                Vous êtes responsable de la confidentialité de votre mot de
                passe et des actions effectuées depuis votre compte. Signalez
                sans délai tout accès non autorisé.
              </p>
            </>
          ),
        },
        {
          id: "besoin",
          title: "Dépôt d’un besoin",
          body: (
            <>
              <p>
                Le dépôt d’un besoin est gratuit. La demande est acheminée vers
                les avocats compétents dans le domaine et le ressort concernés.
              </p>
              <p>
                Aucun délai de réponse n’est garanti, et il se peut qu’aucune
                réponse ne parvienne : le nombre d’avocats disponibles dans un
                domaine donné varie. La plateforme s’engage à acheminer la
                demande, pas à produire une réponse.
              </p>
              <p>
                Une demande manifestement abusive, injurieuse, ou déposée dans
                un but étranger à la recherche d’un conseil juridique peut être
                écartée.
              </p>
            </>
          ),
        },
        {
          id: "guides",
          title: "Guides et modèles",
          body: (
            <>
              <p>
                Les guides sont rédigés par des avocats vérifiés. Certains sont
                en lecture libre ; les autres laissent lire une part de leur
                contenu — environ trente pour cent — avant déblocage.
              </p>
              <p>
                Un guide débloqué reste accessible sans limite de durée depuis
                votre compte. Un guide retiré par son auteur reste accessible à
                ceux qui l’avaient déjà débloqué.
              </p>
              <p>
                Un guide présente un cadre général. Il ne constitue pas une
                consultation adaptée à votre situation et n’engage son auteur
                que sur le contenu publié.
              </p>
            </>
          ),
        },
        {
          id: "paiements",
          title: "Paiements",
          body: (
            <>
              <p>
                Les paiements sont opérés par des prestataires spécialisés,
                Mobile Money et carte bancaire. Aucune donnée bancaire ne
                transite par nos serveurs ni n’y est stockée : la saisie a lieu
                sur les formulaires hébergés du prestataire.
              </p>
              <p>
                Les montants sont exprimés en francs CFA, toutes taxes
                comprises. Un contenu numérique débloqué et consulté n’ouvre pas
                droit à rétractation ; un paiement débité sans déblocage effectif
                est remboursé sur signalement.
              </p>
              <p>
                La plateforme prélève une commission sur les ventes de guides et
                sur les prestations réglées via le site. Son taux figure dans
                l’espace praticien.
              </p>
            </>
          ),
        },
        {
          id: "usage",
          title: "Usages interdits",
          body: (
            <>
              <p>Sont notamment interdits :</p>
              <ul>
                <li>
                  extraire, copier ou revendre tout ou partie de l’annuaire ou de
                  la bibliothèque, y compris par des moyens automatisés ;
                </li>
                <li>
                  déposer un avis mensonger, acheté, ou concernant un praticien
                  avec lequel vous n’avez pas échangé ;
                </li>
                <li>
                  usurper la qualité d’avocat ou l’identité d’un tiers ;
                </li>
                <li>
                  tenter d’accéder à un compte, un dossier ou un contenu payant
                  sans y avoir droit ;
                </li>
                <li>
                  publier un contenu illicite, diffamatoire ou contraire aux
                  règles de l’Ordre.
                </li>
              </ul>
              <p>
                Un manquement peut entraîner la suspension immédiate du compte,
                sans préjudice des suites judiciaires.
              </p>
            </>
          ),
        },
        {
          id: "disponibilite",
          title: "Disponibilité et évolution du service",
          body: (
            <p>
              Le service peut être interrompu pour maintenance ou pour une cause
              extérieure. La plateforme peut faire évoluer ses fonctionnalités et
              ses conditions ; toute modification substantielle est annoncée
              avant son entrée en vigueur, et la poursuite de l’usage vaut
              acceptation.
            </p>
          ),
        },
        {
          id: "resiliation",
          title: "Résiliation",
          body: (
            <>
              <p>
                Vous pouvez fermer votre compte à tout moment. La fermeture
                emporte suppression de vos données personnelles dans les
                conditions décrites par la{" "}
                <Link href="/confidentialite">politique de protection des données</Link>.
              </p>
              <p>
                Les avis déjà publiés survivent à la fermeture du compte : ils
                appartiennent à la réputation du praticien concerné et sont
                anonymisés plutôt que supprimés.
              </p>
            </>
          ),
        },
        {
          id: "droit",
          title: "Droit applicable et différends",
          body: (
            <p>
              Les présentes conditions sont soumises au droit camerounais. En cas
              de différend, une solution amiable est recherchée en priorité, par
              le <Link href="/contact">formulaire de contact</Link>. À défaut, le
              litige relève des juridictions compétentes du siège de l’éditeur.
            </p>
          ),
        },
      ]}
    />
  );
}
