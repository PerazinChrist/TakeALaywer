/**
 * Types partagés entre le serveur et le navigateur.
 *
 * Ce module ne lit aucune variable d'environnement : il est sûr des deux côtés
 * de la frontière, contrairement à `lib/api/server.ts`.
 */

// `import type` est entièrement effacé à la compilation : ce fichier ne tire
// donc pas `lib/api/public` — un module serveur — dans le bundle du navigateur.
import type { Facet, GuideSummary } from "@/lib/api/public";

/** Messages d'erreur par nom de champ, tels que les renvoie le plugin. */
export type FieldErrors = Record<string, string>;

export const API_ERROR_FALLBACK = "Une erreur est survenue. Réessayez dans un instant.";

/**
 * Réponse normalisée d'un appel à l'API.
 *
 * Un seul type pour le succès et l'échec : l'appelant teste `ok` et n'a jamais
 * à deviner la forme de ce qu'il reçoit.
 */
export type ApiEnvelope<T> = {
  ok: boolean;
  status: number;
  /** Message global, vide en cas de succès. */
  message: string;
  /** Erreurs par champ, à rattacher aux entrées du formulaire. */
  errors: FieldErrors;
  data: T | null;
};

/* -------------------------------------------------------------------------- */
/* Charges utiles du plugin                                                   */
/* -------------------------------------------------------------------------- */

export type AccountStatus = "en_attente" | "verifie" | "refuse" | "suspendu";

export type ApiAccount = {
  /** UUID public — jamais l'auto-incrément de la base. */
  id: string;
  accountType: "individuel" | "cabinet";
  status: AccountStatus;
  email: string;
  phone: string;
  name: string;
  bar: string;
  city: string;
  district: string;
  address: string;
  poBox: string;
  website: string;
  plan: string;
  specialties: string[];
  languages: string[];
  createdAt: string;

  /* Avocat indépendant — absents sur un compte cabinet. */
  lastName?: string;
  firstName?: string;
  birthDate?: string | null;
  licenceNumber?: string;
  oathDate?: string | null;
  experienceYears?: number | null;

  /* Cabinet — absents sur un compte individuel. */
  firmName?: string;
  legalForm?: string;
  rccm?: string;
  foundedOn?: string | null;
  managerName?: string;
  managerRole?: string;
  headcount?: number | null;
};

/**
 * Champs du compte modifiables depuis l'espace praticien.
 *
 * Le statut de vérification, la formule et les consentements en sont absents :
 * le plugin les refuserait de toute façon, les lister ici éviterait surtout
 * qu'un formulaire les propose par mégarde.
 */
export type AccountDraft = Partial<
  Pick<
    ApiAccount,
    | "email"
    | "phone"
    | "bar"
    | "city"
    | "district"
    | "address"
    | "poBox"
    | "website"
    | "specialties"
    | "languages"
    | "lastName"
    | "firstName"
    | "birthDate"
    | "licenceNumber"
    | "oathDate"
    | "experienceYears"
    | "firmName"
    | "legalForm"
    | "rccm"
    | "foundedOn"
    | "managerName"
    | "managerRole"
    | "headcount"
  >
>;

export type ApiDocument = {
  type: string;
  label: string;
  required: boolean;
  /** « manquant », « en_attente », « valide » ou « refuse ». */
  status: string;
  originalName?: string | null;
  uploadedAt?: string | null;
  reviewNote?: string | null;
};

/** Réponse de POST /auth/register, une fois le jeton retiré par Next. */
export type RegisterResult = {
  account: ApiAccount;
  documents: ApiDocument[];
  message: string;
};

/** Réponse de POST /auth/login, une fois le jeton retiré par Next. */
export type LoginResult = {
  account: ApiAccount;
};

/**
 * Un avis vu par son destinataire — GET /me/reviews.
 *
 * Il porte son statut de modération, contrairement à l'avis servi au public :
 * un avis rejeté ou en attente n'existe pas encore pour un visiteur.
 */
export type ManagedReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  /** Date relative calculée par le serveur (« il y a 3 jours »). */
  date: string;
  context: string;
  quote: string;
  reply: string | null;
  /** Vrai lorsque l'avis émane d'un compte citoyen enregistré. */
  certified: boolean;
  status: "en_attente" | "publie" | "rejete";
};

export type ReviewsResult = {
  items: ManagedReview[];
  counts: Record<string, number>;
  /** Moyenne des seuls avis publiés. */
  average: number;
};

/** Réponse de GET /auth/me. */
export type MeResult = {
  account: ApiAccount;
  profile: Record<string, unknown> | null;
  documents: ApiDocument[];
  subscription: Record<string, unknown> | null;
  /** Absent des installations antérieures à la 1.4.0 du plugin. */
  counters?: AccountCounters;
};

/**
 * Référentiels du plugin — GET /referentials.
 *
 * Le front en a besoin partout où il propose une liste fermée : barreaux,
 * villes, formes juridiques. Les dupliquer en dur ferait diverger le formulaire
 * de la validation serveur au premier ajout de ville.
 */
export type ApiReferentials = {
  bars: string[];
  specialties: string[];
  cities: string[];
  legalForms: string[];
  managerRoles: string[];
  languages: string[];
};

/* -------------------------------------------------------------------------- */
/* Comptes citoyens                                                           */
/* -------------------------------------------------------------------------- */

export type ClientStatus = "actif" | "inactif" | "suspendu";

/**
 * Compte citoyen, vu par son titulaire.
 *
 * `pseudonym` est l'identité publique : c'est le seul champ qu'un avocat voit
 * tant que le citoyen n'a pas accepté de se découvrir. Les champs d'identité
 * réelle ne sont servis qu'ici, sur `/client/me`.
 */
export type ApiClient = {
  id: string;
  pseudonym: string;
  city: string;
  status: ClientStatus;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  district: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  needsCount: number;
  purchasesCount: number;
};

/** Champs du profil citoyen modifiables depuis l'espace personnel. */
export type ClientDraft = Partial<
  Pick<
    ApiClient,
    "pseudonym" | "firstName" | "lastName" | "email" | "phone" | "city" | "district"
  >
>;

export type PurchaseStatus = "paye" | "en_attente" | "rembourse";

/**
 * Une ligne de la bibliothèque personnelle.
 *
 * `title` et `slug` sont ceux enregistrés au moment de l'achat : un guide
 * dépublié depuis reste listé, avec `available` à false et `guide` à null.
 */
export type ClientPurchase = {
  id: string;
  status: PurchaseStatus;
  statusLabel: string;
  amount: number;
  currency: string;
  method: string;
  reference: string;
  /** Date relative calculée par le serveur (« il y a 3 jours »). */
  purchasedAt: string;
  purchasedOn: string;
  title: string;
  slug: string;
  available: boolean;
  /** Guide complet quand il est encore publié, null sinon. */
  guide: GuideSummary | null;
};

/** Une entrée du journal d'activité, telle que la voit le citoyen. */
export type ClientActivity = {
  id: string;
  /** Identifiant court : « client.login », « client.purchase »… */
  action: string;
  detail: string;
  date: string;
  at: string;
};

/** Un avis déposé par le citoyen, statut de modération compris. */
export type ClientReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  context: string;
  quote: string;
  reply: string | null;
  certified: boolean;
  status: "en_attente" | "publie" | "rejete";
  lawyer: { slug: string; name: string };
};

export type ClientStats = {
  purchases: number;
  /** Total réellement dépensé, en FCFA. */
  spent: number;
  reviews: number;
};

/* -------------------------------------------------------------------------- */
/* Espace communautaire                                                       */
/* -------------------------------------------------------------------------- */

/** Régime d'un besoin : ouvert à tous, ou adressé à un cabinet. */
export type NeedScope = "public" | "prive";

export type NeedStatus = "ouvert" | "resolu" | "ferme" | "modere";

/**
 * Un problème déposé depuis « Poser mon problème ».
 *
 * `excerpt` est toujours servi, `body` seulement sur la page de détail : une
 * liste de douze récits complets pèserait pour rien.
 */
export type CommunityNeed = {
  id: string;
  slug: string;
  scope: NeedScope;
  title: string;
  excerpt: string;
  body?: string;
  specialty: string;
  city: string;
  urgency: string;
  budget: string;
  status: NeedStatus;
  /** Pseudonyme, ou « Membre » quand l'auteur a choisi l'anonymat. */
  author: string;
  anonymous: boolean;
  views: number;
  replies: number;
  helpful: number;
  date: string;
  activeAt: string;
  at: string;
  /** Cabinet visé — présent uniquement sur un besoin privé. */
  lawyer?: { slug: string; name: string };
};

/**
 * Une réponse de l'espace communautaire.
 *
 * `lawyer` n'est renseigné que lorsque la réponse vient d'un compte praticien
 * **vérifié** : c'est ce champ, et lui seul, qui déclenche le badge « Avocat ».
 */
export type NeedReply = {
  id: string;
  body: string;
  author: string;
  initials: string;
  helpful: number;
  date: string;
  at: string;
  lawyer: {
    slug: string;
    name: string;
    bar: string;
    city: string;
    type: "individuel" | "cabinet";
  } | null;
};

export type NeedsResult = {
  items: CommunityNeed[];
  total: number;
  pages: number;
  page: number;
  facets: { specialties: Facet[]; cities: Facet[] } | null;
};

export type NeedDetail = {
  need: CommunityNeed;
  replies: NeedReply[];
  /** Cibles déjà marquées « utile » par le lecteur — « need:12 », « reply:34 ». */
  voted: string[];
  isOwner: boolean;
};

/* -------------------------------------------------------------------------- */
/* Messagerie                                                                 */
/* -------------------------------------------------------------------------- */

/** L'interlocuteur d'un fil — jamais soi-même. */
export type ConversationPeer = {
  type: "client" | "account";
  name: string;
  /** Slug de vitrine quand l'interlocuteur est un praticien, vide sinon. */
  slug: string;
  initials: string;
  city: string;
};

export type Conversation = {
  /** UUID public : l'auto-incrément n'apparaît jamais dans une URL. */
  id: string;
  subject: string;
  status: string;
  unread: number;
  excerpt: string;
  date: string;
  at: string;
  needId: string;
  with: ConversationPeer;
};

export type ConversationMessage = {
  id: string;
  from: "client" | "account" | "system";
  author: string;
  /** Vrai quand le lecteur est l'auteur : évite de recomparer à chaque bulle. */
  mine: boolean;
  body: string;
  date: string;
  at: string;
  read: boolean;
};

export type ConversationThread = {
  conversation: Conversation;
  messages: ConversationMessage[];
};

/* -------------------------------------------------------------------------- */
/* Réservations et rendez-vous                                                */
/* -------------------------------------------------------------------------- */

export type BookingKind = "prestation" | "rendez_vous";

export type BookingStatus = "demande" | "confirme" | "refuse" | "annule" | "honore";

export type Booking = {
  id: string;
  kind: BookingKind;
  title: string;
  mode: string;
  price: number;
  currency: string;
  status: BookingStatus;
  statusLabel: string;
  statusTone: string;
  preferredOn: string;
  preferredAt: string;
  slot: string;
  slotLabel: string;
  message: string;
  note: string;
  date: string;
  at: string;
  /** Coordonnées du demandeur — servies au seul praticien destinataire. */
  contact?: { name: string; email: string; phone: string; alias: string; city: string };
  /** Cabinet visé — servi au seul citoyen demandeur. */
  lawyer?: { slug: string; name: string };
};

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export type AppNotification = {
  id: string;
  /** « message.received », « need.reply », « booking.confirme »… */
  type: string;
  title: string;
  body: string;
  /** Chemin front de l'élément concerné, calculé à l'écriture. */
  link: string;
  entityType: string;
  entityId: string;
  read: boolean;
  date: string;
  at: string;
};

export type NotificationsResult = {
  items: AppNotification[];
  unread: number;
};

/* -------------------------------------------------------------------------- */
/* Paiement d'un guide                                                        */
/* -------------------------------------------------------------------------- */

export type PaymentMethod = {
  id: string;
  label: string;
  hint: string;
  /** Faux tant que l'opérateur n'est pas branché : le choix reste visible, grisé. */
  enabled: boolean;
};

/** Réponse de GET /client/guides/{slug}/checkout — le récapitulatif d'achat. */
export type CheckoutOrder = {
  guide: GuideSummary;
  amount: number;
  currency: string;
  free: boolean;
  owned: boolean;
  /** Un paiement a déjà été engagé et attend confirmation. */
  pending: boolean;
  reference: string;
  methods: PaymentMethod[];
  /** Vrai tant qu'aucun prestataire n'encaisse réellement. */
  simulated: boolean;
};

/** Réponse de GET /client/me — tout l'espace personnel en un appel. */
export type ClientMeResult = {
  client: ApiClient;
  stats: ClientStats;
  purchases: ClientPurchase[];
  reviews: ClientReview[];
  activity: ClientActivity[];
  needs: CommunityNeed[];
  bookings: Booking[];
  conversations: Conversation[];
  /** Notifications non lues — alimente la pastille de l'en-tête. */
  notifications: number;
};

/** Compteurs servis avec /auth/me — pastilles de l'espace praticien. */
export type AccountCounters = {
  notifications: number;
  messages: number;
  bookings: number;
};

/** Réponse de POST /client/login et /client/register, jeton retiré par Next. */
export type ClientAuthResult = {
  client: ApiClient;
  message?: string;
};

/** Réponse de POST /client/guides/{slug}/unlock. */
export type UnlockResult = {
  purchase: ClientPurchase;
  /** Faux quand le paiement reste à confirmer : le guide n'est pas ouvert. */
  unlocked: boolean;
  message: string;
};

/** Libellés d'affichage des statuts de compte. */
export const accountStatusLabels: Record<AccountStatus, string> = {
  en_attente: "Vérification en cours",
  verifie: "Compte vérifié",
  refuse: "Inscription refusée",
  suspendu: "Compte suspendu",
};
