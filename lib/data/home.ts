/**
 * Contenu éditorial de la page d'accueil.
 *
 * Ce fichier ne contient plus de données de démonstration : les avocats, les
 * guides, les avis et les compteurs viennent désormais de l'API du plugin
 * (`lib/api/public.ts`). Ce qui reste ici est du contenu de marque — les
 * situations de vie, les questions du diagnostic, les trois étapes — c'est-à-dire
 * ce qui relève de la ligne éditoriale et non des inscriptions en base.
 *
 * La distinction vaut d'être tenue : un chiffre affiché doit venir de la base,
 * une formulation doit venir d'ici. Mélanger les deux, c'est se retrouver à
 * publier « 7 000 avocats » sur un annuaire qui en compte cent quatre-vingts.
 */

/**
 * Domaines du droit et villes proposés dans les listes déroulantes.
 *
 * Ils doublent le référentiel du plugin (Réglages → Domaines de spécialité,
 * Villes) parce qu'un formulaire doit pouvoir s'afficher avant tout appel
 * réseau. Les valeurs doivent rester identiques au mot près : ce sont elles qui
 * servent de clé de filtre côté serveur.
 */
export const specialties = [
  "Droit des affaires",
  "Droit du travail",
  "Droit de la famille",
  "Droit foncier & immobilier",
  "Droit pénal",
  "Droit fiscal",
  "Droit des contrats",
  "Propriété intellectuelle",
  "Droit des étrangers",
  "Recouvrement de créances",
] as const;

export const cities = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Garoua",
  "Bamenda",
  "Buea",
  "Kribi",
  "Maroua",
  "Ngaoundéré",
  "Limbé",
] as const;

/* -------------------------------------------------------------------------- */
/* Cards interactives par besoin direct — directive-ui.md § 1                 */
/* -------------------------------------------------------------------------- */

export type NeedCard = {
  slug: string;
  title: string;
  hint: string;
  /** Domaine du référentiel — sert à compter les avocats réellement inscrits. */
  specialty: string;
  icon: "briefcase" | "home" | "users" | "heart" | "file" | "land";
};

export const needCards: NeedCard[] = [
  {
    slug: "creer-entreprise",
    title: "Je souhaite créer une entreprise",
    hint: "Statuts, SARL, agréments, fiscalité de démarrage",
    specialty: "Droit des affaires",
    icon: "briefcase",
  },
  {
    slug: "litige-proprietaire",
    title: "Litige avec mon propriétaire",
    hint: "Bail, expulsion, caution, loyers impayés",
    specialty: "Droit foncier & immobilier",
    icon: "home",
  },
  {
    slug: "licenciement-contrat-travail",
    title: "Licenciement ou contrat de travail",
    hint: "Solde de tout compte, abus, requalification",
    specialty: "Droit du travail",
    icon: "users",
  },
  {
    slug: "procedure-divorce",
    title: "Procédure de divorce",
    hint: "Garde des enfants, pension, partage des biens",
    specialty: "Droit de la famille",
    icon: "heart",
  },
  {
    slug: "titre-foncier",
    title: "Problème de titre foncier",
    hint: "Bornage, double vente, succession de terrain",
    specialty: "Droit foncier & immobilier",
    icon: "land",
  },
  {
    slug: "impaye-client",
    title: "Un client ne me paie pas",
    hint: "Mise en demeure, injonction, recouvrement",
    specialty: "Recouvrement de créances",
    icon: "file",
  },
];

/* -------------------------------------------------------------------------- */
/* Diagnostic rapide en 3 clics — directive-ui.md § 1                         */
/* -------------------------------------------------------------------------- */

export type DiagnosticOption = {
  id: string;
  label: string;
  /**
   * Étape 1 : le libellé exact du domaine, qui sert de clé de comptage et de
   * filtre. Étapes 2 et 3 : une nuance affichée dans la réponse.
   */
  meta: string;
};

export type DiagnosticStep = {
  question: string;
  helper: string;
  options: DiagnosticOption[];
};

export const diagnosticSteps: DiagnosticStep[] = [
  {
    question: "En quoi pouvons-nous vous aider aujourd’hui ?",
    helper: "Choisissez le domaine le plus proche de votre situation.",
    options: [
      { id: "affaires", label: "Entreprise & affaires", meta: "Droit des affaires" },
      { id: "travail", label: "Travail & emploi", meta: "Droit du travail" },
      { id: "famille", label: "Famille & personne", meta: "Droit de la famille" },
      { id: "foncier", label: "Terrain & logement", meta: "Droit foncier & immobilier" },
      { id: "penal", label: "Plainte & pénal", meta: "Droit pénal" },
      { id: "fiscal", label: "Impôts & fiscalité", meta: "Droit fiscal" },
    ],
  },
  {
    question: "Où en êtes-vous exactement ?",
    helper: "Cela nous permet d’évaluer le degré d’urgence.",
    options: [
      { id: "info", label: "Je m’informe encore", meta: "Sans urgence" },
      { id: "conflit", label: "Un conflit a démarré", meta: "À traiter cette semaine" },
      { id: "courrier", label: "J’ai reçu un courrier officiel", meta: "Urgent" },
      { id: "audience", label: "Une audience est fixée", meta: "Très urgent" },
    ],
  },
  {
    question: "De quoi avez-vous besoin maintenant ?",
    helper: "Vous pourrez toujours changer d’avis ensuite.",
    options: [
      { id: "comprendre", label: "Comprendre mes droits", meta: "guides" },
      { id: "avocat", label: "Parler à un avocat", meta: "besoin" },
      { id: "document", label: "Faire relire un document", meta: "document" },
      { id: "represente", label: "Être représenté en justice", meta: "besoin" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Comment ça marche — project-modules.md § 3 étapes                          */
/* -------------------------------------------------------------------------- */

export const howItWorksSteps = [
  {
    step: "01",
    title: "Posez votre problème anonymement",
    description:
      "Un formulaire guidé, sans jargon, en 3 minutes. Vous restez sous pseudonyme : aucun avocat ne voit votre identité avant votre accord.",
    icon: "send" as const,
    highlight: "Gratuit & anonyme",
  },
  {
    step: "02",
    title: "Recevez des offres d’avocats",
    description:
      "Votre besoin est acheminé vers les avocats compétents dans la spécialité concernée. Ils vous répondent avec une proposition claire.",
    icon: "message" as const,
    highlight: "Réponses sous 24h",
  },
  {
    step: "03",
    title: "Consultez ou achetez un guide",
    description:
      "Échangez par messagerie chiffrée, prenez rendez-vous, ou réglez le problème seul avec un guide rédigé par un avocat.",
    icon: "shield" as const,
    highlight: "Paiement sécurisé",
  },
];

/* -------------------------------------------------------------------------- */
/* Page d'accueil « épurée » (variante /accueil-epure)                        */
/* -------------------------------------------------------------------------- */

export const simpleSteps = [
  {
    step: "1",
    title: "Posez",
    description:
      "Décrivez votre situation en 2 minutes, sans donner votre identité.",
    icon: "send" as const,
  },
  {
    step: "2",
    title: "Choisissez",
    description:
      "Comparez les avocats qui vous répondent et retenez celui qui vous convient.",
    icon: "users" as const,
  },
  {
    step: "3",
    title: "Résolvez",
    description:
      "Consultez votre avocat, ou réglez le problème seul avec un guide dès 250 FCFA.",
    icon: "check" as const,
  },
];

export const reassurancePoints = [
  {
    title: "100 % anonyme & confidentiel",
    description: "Posez votre question sans afficher votre nom.",
    icon: "lock" as const,
  },
  {
    title: "Avocats qualifiés",
    description: "Vos interlocuteurs sont tous inscrits au Barreau.",
    icon: "scale" as const,
  },
  {
    title: "Paiement mobile simple",
    description:
      "Débloquez vos guides ou consultations en 1 clic par Mobile Money.",
    icon: "phone" as const,
  },
];
