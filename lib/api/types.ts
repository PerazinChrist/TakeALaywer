/**
 * Types partagés entre le serveur et le navigateur.
 *
 * Ce module ne lit aucune variable d'environnement : il est sûr des deux côtés
 * de la frontière, contrairement à `lib/api/server.ts`.
 */

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

/** Réponse de GET /auth/me. */
export type MeResult = {
  account: ApiAccount;
  profile: Record<string, unknown> | null;
  documents: ApiDocument[];
  subscription: Record<string, unknown> | null;
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

/** Libellés d'affichage des statuts de compte. */
export const accountStatusLabels: Record<AccountStatus, string> = {
  en_attente: "Vérification en cours",
  verifie: "Compte vérifié",
  refuse: "Inscription refusée",
  suspendu: "Compte suspendu",
};
