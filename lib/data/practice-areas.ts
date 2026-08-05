/**
 * Domaines du droit — pages d'atterrissage éditoriales.
 *
 * Le libellé `specialty` doit correspondre au mot près à celui du référentiel
 * du plugin (Réglages → Domaines de spécialité). C'est lui qui sert de clé de
 * filtre à l'annuaire et à la bibliothèque : un accent ou une esperluette qui
 * diverge, et la page affiche « aucun avocat » sur un domaine qui en compte
 * quarante.
 *
 * Le reste — accroche, situations, questions — est du contenu de marque : il
 * n'a pas sa place en base, il change au rythme de la ligne éditoriale et non
 * au rythme des inscriptions.
 */

export type PracticeArea = {
  /** Segment d'URL : /domaines/{slug}. Stable, il est indexé. */
  slug: string;
  /** Libellé exact du référentiel — sert de filtre. */
  specialty: string;
  /** Titre affiché, plus court que le libellé du référentiel. */
  title: string;
  /** Une phrase qui situe le domaine sans jargon. */
  tagline: string;
  /** Deux paragraphes de présentation. */
  intro: string[];
  /** Situations concrètes : c'est ainsi que le visiteur se reconnaît. */
  situations: string[];
  /** Questions que le visiteur se pose avant de contacter un avocat. */
  questions: string[];
};

export const practiceAreas: PracticeArea[] = [
  {
    slug: "droit-des-affaires",
    specialty: "Droit des affaires",
    title: "Droit des affaires",
    tagline: "Créer, structurer et défendre une entreprise.",
    intro: [
      "Le droit des affaires couvre la vie d’une société de sa création à sa dissolution : statuts, gouvernance, contrats commerciaux, relations entre associés et contentieux.",
      "C’est le domaine où l’anticipation rapporte le plus. Une clause bien rédigée coûte quelques dizaines de milliers de francs ; le litige qu’elle aurait évité en coûte cent fois plus.",
    ],
    situations: [
      "Je veux créer une SARL et je ne sais pas par où commencer",
      "Mon associé bloque les décisions et je ne peux plus avancer",
      "Un partenaire commercial rompt notre contrat du jour au lendemain",
      "Je veux céder mes parts et j’ignore ce que prévoit le pacte",
      "Je dois fermer ma société sans laisser de dettes derrière moi",
    ],
    questions: [
      "Quel statut juridique choisir pour mon activité ?",
      "Que doit contenir un pacte d’associés ?",
      "Combien de temps prend réellement une immatriculation ?",
      "Suis-je personnellement responsable des dettes de ma société ?",
    ],
  },
  {
    slug: "droit-du-travail",
    specialty: "Droit du travail",
    title: "Droit du travail",
    tagline: "La relation entre un employeur et un salarié, de l’embauche à la rupture.",
    intro: [
      "Contrat, période d’essai, salaire, congés, sanctions, licenciement : le droit du travail encadre chaque étape de la relation d’emploi, côté salarié comme côté employeur.",
      "C’est aussi le domaine où les délais sont les plus courts. Beaucoup de dossiers solides se perdent parce que la saisine est arrivée trop tard.",
    ],
    situations: [
      "J’ai été licencié et le motif me semble inventé",
      "Mon solde de tout compte ne correspond pas à ce que j’avais calculé",
      "Mon employeur me demande de signer une rupture le jour même",
      "Je veux embaucher et je ne sais pas quel contrat rédiger",
      "Un salarié conteste une sanction que j’ai prononcée",
    ],
    questions: [
      "Dans quel délai puis-je contester un licenciement ?",
      "Comment se calculent les indemnités de rupture ?",
      "Faut-il passer par l’inspection du travail avant le tribunal ?",
      "Une clause de non-concurrence sans contrepartie est-elle valable ?",
    ],
  },
  {
    slug: "droit-de-la-famille",
    specialty: "Droit de la famille",
    title: "Droit de la famille",
    tagline: "Mariage, divorce, enfants et successions.",
    intro: [
      "Le droit de la famille traite des situations les plus personnelles : la séparation, la garde des enfants, la pension alimentaire, le partage d’un héritage.",
      "Ce sont des dossiers où l’accord vaut presque toujours mieux que la décision imposée — un accord se révise sans nouvelle audience, un jugement non.",
    ],
    situations: [
      "Je veux divorcer et je ne sais pas ce que cela implique pour les enfants",
      "La pension alimentaire n’est plus versée depuis des mois",
      "Mon ex-conjoint m’empêche de voir mon enfant",
      "Une succession est bloquée depuis des années par un désaccord",
      "Je veux protéger mon conjoint en cas de décès",
    ],
    questions: [
      "Qu’est-ce que le juge regarde vraiment pour la garde ?",
      "Comment se calcule une pension alimentaire ?",
      "Peut-on divorcer sans passer devant le tribunal ?",
      "Que faire quand un héritier refuse le partage ?",
    ],
  },
  {
    slug: "droit-foncier-immobilier",
    specialty: "Droit foncier & immobilier",
    title: "Droit foncier et immobilier",
    tagline: "Acheter, louer, borner et défendre un terrain.",
    intro: [
      "Titre foncier, bornage, bail, expulsion, double vente : le foncier concentre à lui seul une large part des litiges portés devant les tribunaux.",
      "La plupart de ces contentieux étaient évitables. Une vérification à la conservation foncière avant de payer règle à elle seule la majorité des mauvaises surprises.",
    ],
    situations: [
      "Je veux acheter un terrain et vérifier qu’il est vraiment libre",
      "Le terrain que j’ai acheté a été vendu à quelqu’un d’autre",
      "Mon voisin conteste la limite entre nos parcelles",
      "Mon bailleur veut m’expulser sans décision de justice",
      "Ma caution ne m’a jamais été restituée",
    ],
    questions: [
      "Quelles pièces exiger d’un vendeur avant de payer ?",
      "Que vaut une vente signée devant témoins sans acte notarié ?",
      "Comment faire opposition sur un titre foncier ?",
      "Que peut légalement retenir un bailleur sur la caution ?",
    ],
  },
  {
    slug: "droit-penal",
    specialty: "Droit pénal",
    title: "Droit pénal",
    tagline: "Être défendu, ou faire valoir ses droits de victime.",
    intro: [
      "Garde à vue, plainte, instruction, audience : le droit pénal engage la liberté, et les premières heures y comptent souvent plus que les mois suivants.",
      "Que l’on soit mis en cause ou victime, l’exigence est la même : un dossier tenu, des pièces datées, et une procédure contrôlée à chaque étape.",
    ],
    situations: [
      "Un proche est en garde à vue et je ne sais pas quoi faire",
      "J’ai déposé plainte et rien ne bouge depuis des mois",
      "Je suis convoqué et je ne connais pas les faits reprochés",
      "J’ai été victime d’une escroquerie et je veux être indemnisé",
      "Une audience est fixée et je n’ai pas d’avocat",
    ],
    questions: [
      "Quels sont mes droits pendant une garde à vue ?",
      "Faut-il déposer une simple plainte ou se constituer partie civile ?",
      "Que faire si ma plainte est classée sans suite ?",
      "Combien de temps dure une instruction ?",
    ],
  },
  {
    slug: "droit-fiscal",
    specialty: "Droit fiscal",
    title: "Droit fiscal",
    tagline: "Contrôles, redressements et conformité de l’entreprise.",
    intro: [
      "Le droit fiscal encadre les relations avec l’administration : déclarations, contrôles, redressements et réclamations.",
      "Un contrôle se prépare. Les délais de réponse à une notification ne se rattrapent pas, et un accord oral avec un vérificateur n’engage personne.",
    ],
    situations: [
      "J’ai reçu un avis de vérification et je ne sais pas quoi préparer",
      "Le redressement proposé me paraît disproportionné",
      "Je veux contester une imposition déjà mise en recouvrement",
      "Je ne suis pas sûr d’être assujetti à la TVA",
      "Je veux mettre mon entreprise en conformité avant un contrôle",
    ],
    questions: [
      "Que vérifie l’administration en priorité ?",
      "Dans quel délai dois-je répondre à une proposition de rectification ?",
      "Puis-je obtenir un sursis de paiement pendant ma réclamation ?",
      "Accepter un redressement m’empêche-t-il de le contester ensuite ?",
    ],
  },
  {
    slug: "droit-des-contrats",
    specialty: "Droit des contrats",
    title: "Droit des contrats",
    tagline: "Rédiger, relire et faire respecter un engagement écrit.",
    intro: [
      "Un contrat organise une relation dans le temps, y compris sa fin. C’est aux clauses de sortie qu’on juge sa qualité, pas à sa longueur.",
      "La relecture avant signature reste l’intervention la moins chère et la plus rentable de tout le droit des affaires.",
    ],
    situations: [
      "On me demande de signer un contrat rapidement",
      "Mon prestataire ne livre pas ce qui était prévu",
      "Je veux rompre un contrat commercial sans m’exposer",
      "Une clause du contrat me paraît abusive",
      "J’ai besoin d’un contrat sur mesure pour mon activité",
    ],
    questions: [
      "Quelles clauses faut-il négocier en priorité ?",
      "Que vaut un accord conclu par messages ?",
      "Comment rompre un contrat sans indemnité ?",
      "Une limitation de responsabilité est-elle toujours valable ?",
    ],
  },
  {
    slug: "propriete-intellectuelle",
    specialty: "Propriété intellectuelle",
    title: "Propriété intellectuelle",
    tagline: "Protéger une marque, une création, un savoir-faire.",
    intro: [
      "Marques, dessins, brevets et droits d’auteur : la propriété intellectuelle protège ce qui distingue une activité de ses concurrentes.",
      "Une marque non déposée n’appartient à personne. Le dépôt à l’OAPI produit effet dans l’ensemble des États membres, ce qui en fait la démarche la plus rentable du domaine.",
    ],
    situations: [
      "Je veux déposer le nom de mon entreprise comme marque",
      "Quelqu’un utilise mon nom commercial",
      "Un concurrent copie mes visuels et mes textes",
      "Je veux céder ou concéder l’usage de ma marque",
      "Ma demande de dépôt a été refusée",
    ],
    questions: [
      "Comment savoir si un nom est déjà pris ?",
      "Combien de classes faut-il désigner au dépôt ?",
      "Que faire face à une contrefaçon avérée ?",
      "Une marque non exploitée peut-elle être perdue ?",
    ],
  },
  {
    slug: "droit-des-etrangers",
    specialty: "Droit des étrangers",
    title: "Droit des étrangers",
    tagline: "Séjour, travail et recours contre une décision administrative.",
    intro: [
      "Les demandes de titre de séjour se perdent rarement sur le fond : elles échouent sur une pièce manquante, une traduction absente ou un délai dépassé.",
      "Les délais de recours contre une décision de refus sont courts et courent depuis la notification, pas depuis le jour où l’on en mesure les conséquences.",
    ],
    situations: [
      "Ma demande de titre de séjour a été refusée",
      "Je ne sais pas sous quel fondement déposer ma demande",
      "Mon dossier est en attente depuis des mois sans réponse",
      "Je veux faire venir ma famille",
      "J’ai reçu une mesure d’éloignement",
    ],
    questions: [
      "Quelles pièces manquent le plus souvent dans un dossier ?",
      "Le recours gracieux suspend-il le délai de recours ?",
      "Que faire si l’administration ne répond pas ?",
      "Comment contester une mesure d’éloignement en urgence ?",
    ],
  },
  {
    slug: "recouvrement-de-creances",
    specialty: "Recouvrement de créances",
    title: "Recouvrement de créances",
    tagline: "Se faire payer, de la relance à la saisie.",
    intro: [
      "Une créance se recouvre d’autant mieux qu’on agit tôt. Passé quelques mois, les relances ne servent plus qu’à laisser filer la prescription.",
      "Avant d’engager des frais, une question tranche tout le dossier : le débiteur est-il solvable ? Une saisie sur un patrimoine vide coûte sans rien rapporter.",
    ],
    situations: [
      "Un client ne me paie plus et ne répond plus",
      "J’ai un jugement mais je n’arrive pas à le faire exécuter",
      "Ma facture est contestée alors que la prestation est livrée",
      "Je veux savoir si la procédure vaut le coût",
      "Un chèque m’a été remis sans provision",
    ],
    questions: [
      "Ma créance est-elle recouvrable en l’état ?",
      "Combien de temps prend une injonction de payer ?",
      "Que faire si le débiteur forme opposition ?",
      "Comment vérifier la solvabilité avant d’agir ?",
    ],
  },
];

/** Retourne un domaine par son segment d'URL. */
export function getPracticeArea(slug: string): PracticeArea | undefined {
  return practiceAreas.find((area) => area.slug === slug);
}

/** Retrouve le segment d'URL d'un domaine à partir de son libellé. */
export function practiceAreaSlug(specialty: string): string | undefined {
  return practiceAreas.find((area) => area.specialty === specialty)?.slug;
}
