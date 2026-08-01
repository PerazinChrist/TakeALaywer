/**
 * Données de la page d'accueil.
 *
 * Contenu de démonstration : chaque bloc correspond à un endpoint du backend
 * NestJS décrit dans project-modules.md (Annuaire 2.1, Marketplace 3.x,
 * Need Matching 4.1, Trust Engine 8.x). Le remplacer par des appels API
 * ne changera pas la forme des composants.
 */

export type Stat = {
  value: string;
  label: string;
  icon: "users" | "incognito" | "clock" | "badge";
  tone: "gold" | "trust" | "marine";
};

/** Barre de réassurance — project-modules.md § Trust Banner */
export const trustStats: Stat[] = [
  { value: "7 000+", label: "Avocats répertoriés", icon: "users", tone: "gold" },
  { value: "100 %", label: "Anonymat garanti", icon: "incognito", tone: "trust" },
  { value: "< 24h", label: "Premières réponses", icon: "clock", tone: "gold" },
  { value: "40 000", label: "Citoyens accompagnés", icon: "badge", tone: "trust" },
];

/** Domaines du droit — alimente le moteur de recherche (module 3.3). */
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
  specialty: string;
  icon: "briefcase" | "home" | "users" | "heart" | "file" | "land";
  lawyers: number;
};

export const needCards: NeedCard[] = [
  {
    slug: "creer-entreprise",
    title: "Je souhaite créer une entreprise",
    hint: "Statuts, SARL, agréments, fiscalité de démarrage",
    specialty: "Droit des affaires",
    icon: "briefcase",
    lawyers: 412,
  },
  {
    slug: "litige-proprietaire",
    title: "Litige avec mon propriétaire",
    hint: "Bail, expulsion, caution, loyers impayés",
    specialty: "Droit foncier & immobilier",
    icon: "home",
    lawyers: 287,
  },
  {
    slug: "licenciement-contrat-travail",
    title: "Licenciement ou contrat de travail",
    hint: "Solde de tout compte, abus, requalification",
    specialty: "Droit du travail",
    icon: "users",
    lawyers: 356,
  },
  {
    slug: "procedure-divorce",
    title: "Procédure de divorce",
    hint: "Garde des enfants, pension, partage des biens",
    specialty: "Droit de la famille",
    icon: "heart",
    lawyers: 301,
  },
  {
    slug: "titre-foncier",
    title: "Problème de titre foncier",
    hint: "Bornage, double vente, succession de terrain",
    specialty: "Droit foncier & immobilier",
    icon: "land",
    lawyers: 198,
  },
  {
    slug: "impaye-client",
    title: "Un client ne me paie pas",
    hint: "Mise en demeure, injonction, recouvrement",
    specialty: "Recouvrement de créances",
    icon: "file",
    lawyers: 233,
  },
];

/* -------------------------------------------------------------------------- */
/* Diagnostic rapide en 3 clics — directive-ui.md § 1                         */
/* -------------------------------------------------------------------------- */

export type DiagnosticOption = {
  id: string;
  label: string;
  /** Étape 1 : spécialité déduite. Étapes 2 et 3 : nuance de la réponse. */
  meta: string;
  /** Étape 1 uniquement : nombre d'avocats disponibles dans le domaine. */
  lawyers?: number;
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
      { id: "affaires", label: "Entreprise & affaires", meta: "Droit des affaires", lawyers: 412 },
      { id: "travail", label: "Travail & emploi", meta: "Droit du travail", lawyers: 356 },
      { id: "famille", label: "Famille & personne", meta: "Droit de la famille", lawyers: 301 },
      { id: "foncier", label: "Terrain & logement", meta: "Droit foncier & immobilier", lawyers: 287 },
      { id: "penal", label: "Plainte & pénal", meta: "Droit pénal", lawyers: 164 },
      { id: "fiscal", label: "Impôts & fiscalité", meta: "Droit fiscal", lawyers: 122 },
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
/* Knowledge Marketplace — module 3                                           */
/* -------------------------------------------------------------------------- */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  /** Gratuit ou payant à l'unité (module 3.2 — paywall dynamique). */
  access: "free" | "premium";
  price?: string;
  views: string;
  author: {
    name: string;
    initials: string;
    role: string;
    verified: boolean;
  };
  /** Aperçu des pépites masquées derrière le paywall (directive-ui.md § 4). */
  unlocks?: string[];
};

export const popularArticles: Article[] = [
  {
    slug: "creer-sarl-etapes",
    title: "Créer une SARL : les 7 étapes que personne ne vous explique",
    excerpt:
      "Du choix de la dénomination au dépôt au greffe, le parcours réel d’une création d’entreprise, avec les délais et les coûts à prévoir.",
    category: "Droit des affaires",
    readingTime: 8,
    access: "free",
    views: "12,4k",
    author: {
      name: "Me Nadège Fokou",
      initials: "NF",
      role: "Avocate au Barreau — Droit des affaires",
      verified: true,
    },
  },
  {
    slug: "licenciement-abusif-recours",
    title: "Licenciement abusif : vos recours et le calcul de vos indemnités",
    excerpt:
      "Votre employeur a rompu votre contrat sans motif réel. Voici comment qualifier l’abus, quel délai respecter et ce que vous pouvez réclamer devant l’inspection du travail.",
    category: "Droit du travail",
    readingTime: 11,
    access: "premium",
    price: "2 500 FCFA",
    views: "9,1k",
    author: {
      name: "Me Alain Bekolo",
      initials: "AB",
      role: "Avocat — Droit social",
      verified: true,
    },
    unlocks: [
      "Modèle de lettre de contestation prêt à envoyer",
      "Grille de calcul des indemnités de rupture",
      "3 jurisprudences clés à citer dans votre dossier",
    ],
  },
  {
    slug: "titre-foncier-double-vente",
    title: "Double vente d’un terrain : comment protéger votre titre foncier",
    excerpt:
      "Le même terrain vendu deux fois est le contentieux foncier le plus courant. Les vérifications à faire avant de payer, et la procédure si le mal est déjà fait.",
    category: "Droit foncier",
    readingTime: 9,
    access: "premium",
    price: "3 000 FCFA",
    views: "15,8k",
    author: {
      name: "Me Serge Ndongo",
      initials: "SN",
      role: "Avocat — Droit foncier",
      verified: true,
    },
    unlocks: [
      "Checklist de vérification avant achat (11 points)",
      "Modèle de requête en annulation de vente",
      "Liste des pièces exigées par la conservation foncière",
    ],
  },
  {
    slug: "divorce-garde-enfants",
    title: "Divorce : ce qui détermine vraiment la garde des enfants",
    excerpt:
      "Les critères retenus par le juge, les erreurs qui desservent un parent, et le rôle de la médiation familiale avant l’audience.",
    category: "Droit de la famille",
    readingTime: 7,
    access: "free",
    views: "18,2k",
    author: {
      name: "Me Clarisse Mbala",
      initials: "CM",
      role: "Avocate — Droit de la famille",
      verified: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Annuaire — module 2.1 + Trust Engine 8.3 (badges)                          */
/* -------------------------------------------------------------------------- */

export type Lawyer = {
  slug: string;
  name: string;
  initials: string;
  specialties: string[];
  city: string;
  rating: number;
  reviews: number;
  experience: string;
  responseTime: string;
  badges: Array<"verified" | "author" | "pioneer">;
  online: boolean;
  articles: number;
};

export const featuredLawyers: Lawyer[] = [
  {
    slug: "nadege-fokou",
    name: "Me Nadège Fokou",
    initials: "NF",
    specialties: ["Droit des affaires", "Droit fiscal"],
    city: "Douala",
    rating: 4.9,
    reviews: 127,
    experience: "14 ans d’expérience",
    responseTime: "Répond en ~1h",
    badges: ["verified", "author", "pioneer"],
    online: true,
    articles: 23,
  },
  {
    slug: "serge-ndongo",
    name: "Me Serge Ndongo",
    initials: "SN",
    specialties: ["Droit foncier & immobilier"],
    city: "Yaoundé",
    rating: 4.8,
    reviews: 94,
    experience: "11 ans d’expérience",
    responseTime: "Répond en ~2h",
    badges: ["verified", "author"],
    online: true,
    articles: 17,
  },
  {
    slug: "clarisse-mbala",
    name: "Me Clarisse Mbala",
    initials: "CM",
    specialties: ["Droit de la famille", "Droit pénal"],
    city: "Douala",
    rating: 5,
    reviews: 68,
    experience: "9 ans d’expérience",
    responseTime: "Répond en ~3h",
    badges: ["verified", "pioneer"],
    online: false,
    articles: 8,
  },
  {
    slug: "alain-bekolo",
    name: "Me Alain Bekolo",
    initials: "AB",
    specialties: ["Droit du travail", "Droit des contrats"],
    city: "Bafoussam",
    rating: 4.7,
    reviews: 81,
    experience: "16 ans d’expérience",
    responseTime: "Répond en ~4h",
    badges: ["verified", "author"],
    online: true,
    articles: 12,
  },
];

/* -------------------------------------------------------------------------- */
/* Avis certifiés — module 8.1 (collectés après une interaction réelle)        */
/* -------------------------------------------------------------------------- */

export type Review = {
  id: string;
  quote: string;
  author: string;
  context: string;
  rating: number;
  city: string;
};

export const certifiedReviews: Review[] = [
  {
    id: "r1",
    quote:
      "J’ai déposé mon problème un dimanche soir sans donner mon nom. Lundi midi, trois avocats m’avaient répondu avec un vrai plan d’action. J’ai choisi le troisième.",
    author: "Emmanuel T.",
    context: "Litige commercial résolu",
    rating: 5,
    city: "Douala",
  },
  {
    id: "r2",
    quote:
      "Le guide sur le licenciement abusif m’a évité une erreur de procédure. Le modèle de lettre inclus valait à lui seul le prix de l’article.",
    author: "Sandrine M.",
    context: "Guide premium acheté",
    rating: 5,
    city: "Yaoundé",
  },
  {
    id: "r3",
    quote:
      "Je n’osais pas appeler un cabinet, j’avais peur de la facture. Ici j’ai vu les honoraires indicatifs avant de m’engager. Tout était clair.",
    author: "Ibrahim N.",
    context: "Consultation en droit foncier",
    rating: 4,
    city: "Garoua",
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
/* Preuve sociale « en direct » — directive-ui.md § 3                         */
/* -------------------------------------------------------------------------- */

export type SocialProofEvent = {
  id: string;
  message: string;
  detail: string;
  tone: "need" | "consult" | "purchase" | "review";
};

export const socialProofEvents: SocialProofEvent[] = [
  {
    id: "sp1",
    message: "Un citoyen de Douala vient de poser une question en droit foncier",
    detail: "il y a quelques secondes",
    tone: "need",
  },
  {
    id: "sp2",
    message: "Mme K. a consulté Me Ndongo",
    detail: "il y a 10 min",
    tone: "consult",
  },
  {
    id: "sp3",
    message: "Un guide sur le licenciement abusif vient d’être débloqué",
    detail: "il y a 4 min",
    tone: "purchase",
  },
  {
    id: "sp4",
    message: "Nouvel avis certifié 5 étoiles pour Me Fokou",
    detail: "il y a 18 min",
    tone: "review",
  },
  {
    id: "sp5",
    message: "3 avocats ont répondu à un besoin en droit du travail",
    detail: "il y a 2 min",
    tone: "need",
  },
];

/** Compteurs dynamiques — module 8.2 (micro-interactions d'engagement). */
export const liveCounters = {
  needsSolvedToday: 12,
  averageResponse: "2h",
  lawyersOnline: 143,
};

/* ==========================================================================
   Page d'accueil « épurée » (variante /accueil-epure)
   --------------------------------------------------------------------------
   Jeux de données propres à la maquette en 4 écrans. Ils vivent à côté des
   précédents plutôt qu'à leur place : les deux pages doivent pouvoir être
   comparées en parallèle, puis l'une des deux supprimée sans casser l'autre.
   ========================================================================== */

/* -------------------------------------------------------------------------- */
/* Écran 2 — carrousel « Avocats à la Une »                                   */
/* -------------------------------------------------------------------------- */

/**
 * Emplacement commercialisé (revenus B2B) : seuls les avocats abonnés
 * Premium ou Pionnier remontent dans ce carrousel. Le back-office filtrera
 * sur `plan` — ici la donnée est déjà pré-filtrée.
 */
export type SpotlightLawyer = {
  slug: string;
  name: string;
  initials: string;
  specialty: string;
  city: string;
  /** Barreau d'appartenance, affiché sous la ville. */
  bar: string;
  rating: number;
  reviews: number;
  experience: string;
  plan: "premium" | "pionnier";
  online: boolean;
};

export const spotlightLawyers: SpotlightLawyer[] = [
  {
    slug: "nadege-fokou",
    name: "Me Nadège Fokou",
    initials: "NF",
    specialty: "Droit des affaires & fiscal",
    city: "Douala",
    bar: "Barreau du Littoral",
    rating: 4.9,
    reviews: 127,
    experience: "14 ans d’expérience",
    plan: "pionnier",
    online: true,
  },
  {
    slug: "serge-ndongo",
    name: "Me Serge Ndongo",
    initials: "SN",
    specialty: "Droit foncier & immobilier",
    city: "Yaoundé",
    bar: "Barreau du Centre",
    rating: 4.8,
    reviews: 94,
    experience: "11 ans d’expérience",
    plan: "premium",
    online: true,
  },
  {
    slug: "clarisse-mbala",
    name: "Me Clarisse Mbala",
    initials: "CM",
    specialty: "Droit de la famille",
    city: "Douala",
    bar: "Barreau du Littoral",
    rating: 5,
    reviews: 68,
    experience: "9 ans d’expérience",
    plan: "pionnier",
    online: false,
  },
  {
    slug: "alain-bekolo",
    name: "Me Alain Bekolo",
    initials: "AB",
    specialty: "Droit du travail",
    city: "Bafoussam",
    bar: "Barreau de l’Ouest",
    rating: 4.7,
    reviews: 81,
    experience: "16 ans d’expérience",
    plan: "premium",
    online: true,
  },
  {
    slug: "rachelle-ewane",
    name: "Me Rachelle Ewané",
    initials: "RE",
    specialty: "Droit pénal & procédure",
    city: "Yaoundé",
    bar: "Barreau du Centre",
    rating: 4.9,
    reviews: 112,
    experience: "12 ans d’expérience",
    plan: "premium",
    online: true,
  },
  {
    slug: "patrick-kamdem",
    name: "Me Patrick Kamdem",
    initials: "PK",
    specialty: "Droit des contrats",
    city: "Kribi",
    bar: "Barreau du Sud",
    rating: 4.8,
    reviews: 57,
    experience: "8 ans d’expérience",
    plan: "pionnier",
    online: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Écran 3 — bibliothèque de guides & modèles, dès 250 FCFA                   */
/* -------------------------------------------------------------------------- */

export type PracticalGuide = {
  slug: string;
  /** Un guide s'explique, un modèle se remplit : la carte le signale. */
  kind: "guide" | "modele";
  title: string;
  category: string;
  /** Les premières lignes restent lisibles… */
  excerpt: string;
  /** …la suite est floutée derrière le paiement (directive-ui.md § 4). */
  blurred: string;
  /** Montant en FCFA — mis en forme par `formatFcfa`. */
  price: number;
  pages: number;
  downloads: string;
  /** Ce que l'achat débloque concrètement — l'argument qui déclenche l'achat. */
  unlocks: [string, string];
  author: { name: string; initials: string };
};

export const practicalGuides: PracticalGuide[] = [
  {
    slug: "litige-bailleur",
    kind: "guide",
    title: "Que faire en cas de litige avec son bailleur ?",
    category: "Droit foncier",
    excerpt:
      "Loyers réclamés à tort, caution jamais rendue, expulsion annoncée du jour au lendemain : voici l’ordre exact des démarches.",
    blurred:
      "Commencez par une mise en demeure recommandée : elle fait courir le délai légal et constitue la première pièce de votre dossier.",
    price: 250,
    pages: 12,
    downloads: "2 340",
    unlocks: [
      "Modèle de mise en demeure prêt à envoyer",
      "Le délai légal à respecter, étape par étape",
    ],
    author: { name: "Me Serge Ndongo", initials: "SN" },
  },
  {
    slug: "modele-contrat-travail",
    kind: "modele",
    title: "Contrat de travail simplifié conforme",
    category: "Droit du travail",
    excerpt:
      "Un modèle prêt à signer, conforme au code du travail : durée, période d’essai, rémunération et clauses obligatoires déjà rédigées.",
    blurred:
      "Article 4 — La période d’essai est fixée à … mois, renouvelable une seule fois par accord écrit des deux parties.",
    price: 500,
    pages: 6,
    downloads: "1 870",
    unlocks: [
      "Document Word modifiable, prêt à signer",
      "Les 5 clauses obligatoires déjà rédigées",
    ],
    author: { name: "Me Alain Bekolo", initials: "AB" },
  },
  {
    slug: "acheter-terrain-securite",
    kind: "guide",
    title: "Les étapes légales pour acheter un terrain en toute sécurité",
    category: "Droit foncier",
    excerpt:
      "Les 11 vérifications à faire avant de verser le moindre franc, et les pièces à exiger du vendeur à chaque étape.",
    blurred:
      "Vérification n°3 : demandez un certificat de propriété daté de moins de trois mois à la conservation foncière du ressort.",
    price: 250,
    pages: 15,
    downloads: "3 120",
    unlocks: [
      "Checklist des 11 vérifications avant de payer",
      "La liste des pièces exigées par le vendeur",
    ],
    author: { name: "Me Serge Ndongo", initials: "SN" },
  },
  {
    slug: "creer-sarl-formalites",
    kind: "guide",
    title: "Créer sa SARL : formalités, délais et coûts réels",
    category: "Droit des affaires",
    excerpt:
      "Le parcours complet du dépôt des statuts à l’immatriculation, avec le budget à prévoir poste par poste.",
    blurred:
      "Étape 5 — Le dépôt au greffe du tribunal de commerce doit intervenir dans les 30 jours suivant la signature des statuts.",
    price: 250,
    pages: 18,
    downloads: "4 015",
    unlocks: [
      "Le budget réel, poste par poste",
      "Le calendrier des formalités jusqu’au greffe",
    ],
    author: { name: "Me Nadège Fokou", initials: "NF" },
  },
];

/* -------------------------------------------------------------------------- */
/* Écran 4 — « Comment ça marche ? » : 3 étapes + 3 réassurances              */
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
