/**
 * Parcours de création d'un compte avocat.
 *
 * Ce module ne contient que la donnée et les règles : formes du formulaire,
 * définition des étapes et validation. Le rendu vit dans
 * components/avocats/inscription/. Séparer les deux permet de faire évoluer
 * les règles sans toucher au JSX — et de les rebrancher plus tard sur la
 * validation serveur (module 2.1) sans les réécrire.
 */

export type AccountType = "individuel" | "cabinet";

export type SignupForm = {
  accountType: AccountType | null;

  /* Identité — avocat indépendant */
  lastName: string;
  firstName: string;
  birthDate: string;

  /* Identité — cabinet */
  firmName: string;
  legalForm: string;
  rccm: string;
  foundedOn: string;
  managerName: string;
  managerRole: string;

  /* Compte (commun) */
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;

  /* Exercice professionnel */
  bar: string;
  licenceNumber: string;
  oathDate: string;
  experienceYears: string;
  headcount: string;
  specialties: string[];
  languages: string[];

  /* Coordonnées */
  city: string;
  district: string;
  address: string;
  poBox: string;
  website: string;

  /**
   * Justificatifs — le fichier lui-même, indexé par identifiant de pièce.
   *
   * On garde l'objet `File` et pas seulement son nom : après la création du
   * compte, chaque pièce est téléversée vers /me/documents, ce qui exige le
   * binaire. Ces fichiers ne vivent que dans l'état du navigateur, le temps du
   * parcours.
   */
  documents: Record<string, File>;

  /* Formule & conditions */
  plan: string;
  acceptCharter: boolean;
  acceptTerms: boolean;
  acceptData: boolean;
};

export const emptySignupForm: SignupForm = {
  accountType: null,
  lastName: "",
  firstName: "",
  birthDate: "",
  firmName: "",
  legalForm: "",
  rccm: "",
  foundedOn: "",
  managerName: "",
  managerRole: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  bar: "",
  licenceNumber: "",
  oathDate: "",
  experienceYears: "",
  headcount: "",
  specialties: [],
  languages: [],
  city: "",
  district: "",
  address: "",
  poBox: "",
  website: "",
  documents: {},
  plan: "",
  acceptCharter: false,
  acceptTerms: false,
  acceptData: false,
};

/* -------------------------------------------------------------------------- */
/* Référentiels                                                               */
/* -------------------------------------------------------------------------- */

export const bars = [
  "Barreau du Littoral",
  "Barreau du Centre",
  "Barreau de l’Ouest",
  "Barreau du Sud",
  "Barreau du Nord",
  "Barreau du Sud-Ouest",
  "Barreau du Nord-Ouest",
  "Barreau de l’Est",
] as const;

export const legalForms = [
  "Cabinet individuel",
  "Société civile professionnelle (SCP)",
  "Société civile de moyens (SCM)",
  "Association d’avocats",
  "Groupement d’intérêt économique",
] as const;

export const managerRoles = [
  "Associé gérant",
  "Avocat fondateur",
  "Bâtonnier honoraire",
  "Directeur du cabinet",
] as const;

export const practiceLanguages = [
  "Français",
  "Anglais",
  "Espagnol",
  "Allemand",
  "Arabe",
  "Langues locales",
] as const;

export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  pitch: string;
  perks: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: "Gratuit",
    period: "",
    pitch: "Pour être trouvé dans l’annuaire.",
    perks: [
      "Fiche publique vérifiée",
      "5 réponses à des besoins par mois",
      "Vitrine simple, sans galerie",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "15 000 FCFA",
    period: "/ mois",
    pitch: "Pour être vu et vendre vos guides.",
    perks: [
      "Mise en avant sur la page d’accueil",
      "Réponses illimitées aux besoins",
      "Galerie photo et publication de guides",
      "Statistiques de consultation",
    ],
    featured: true,
  },
  {
    id: "pionnier",
    name: "Pionnier",
    price: "Offert",
    period: "aux 500 premiers",
    pitch: "L’offre de lancement, à vie.",
    perks: [
      "Tous les avantages Premium",
      "Badge « Pionnier » sur votre vitrine",
      "Commission réduite sur les guides",
      "Accompagnement à la mise en ligne",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Étapes                                                                     */
/* -------------------------------------------------------------------------- */

export type Step = { id: string; title: string; hint: string };

export const signupSteps: Step[] = [
  { id: "type", title: "Type de compte", hint: "Qui s’inscrit ?" },
  { id: "identite", title: "Identité", hint: "Vos informations légales" },
  { id: "exercice", title: "Exercice", hint: "Barreau et spécialités" },
  { id: "contact", title: "Coordonnées", hint: "Où vous joindre" },
  { id: "justificatifs", title: "Justificatifs", hint: "Preuves d’inscription" },
  { id: "formule", title: "Formule", hint: "Choix et validation" },
];

/** Pièces exigées — elles diffèrent selon le type de compte. */
export function requiredDocuments(type: AccountType | null) {
  if (type === "cabinet") {
    return [
      {
        id: "rccm",
        label: "Registre de commerce (RCCM)",
        hint: "PDF ou photo lisible du registre du cabinet.",
        required: true,
      },
      {
        id: "attestation-cabinet",
        label: "Attestation d’inscription du cabinet au Barreau",
        hint: "Datée de moins de 12 mois.",
        required: true,
      },
      {
        id: "piece-gerant",
        label: "Pièce d’identité du représentant légal",
        hint: "CNI ou passeport en cours de validité.",
        required: true,
      },
      {
        id: "logo",
        label: "Logo du cabinet",
        hint: "Facultatif — affiché sur votre vitrine.",
        required: false,
      },
    ];
  }

  return [
    {
      id: "attestation",
      label: "Attestation d’inscription au Barreau",
      hint: "Datée de moins de 12 mois.",
      required: true,
    },
    {
      id: "carte-pro",
      label: "Carte professionnelle d’avocat",
      hint: "Recto lisible, PDF ou image.",
      required: true,
    },
    {
      id: "piece-identite",
      label: "Pièce d’identité",
      hint: "CNI ou passeport en cours de validité.",
      required: true,
    },
    {
      id: "photo",
      label: "Photo de profil professionnelle",
      hint: "Facultatif — vous pourrez l’ajouter plus tard.",
      required: false,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Numéros camerounais : 9 chiffres, indicatif +237 optionnel. */
const PHONE = /^(?:\+?237)?[26]\d{8}$/;
const RCCM = /^[A-Z]{2}[-/][A-Z]{3}[-/]\d{4}[-/][A-Z]\d?[-/]\d{3,6}$/i;

function isFutureDate(value: string) {
  return new Date(value).getTime() > Date.now();
}

function yearsSince(value: string) {
  const then = new Date(value);
  return (Date.now() - then.getTime()) / (365.25 * 24 * 3600 * 1000);
}

/**
 * Valide une étape. Retourne les messages par champ — un objet vide signifie
 * que l'étape est franchissable.
 *
 * Les règles dépendent du type de compte : un cabinet doit produire un RCCM et
 * un représentant légal, un avocat indépendant une date de prestation de
 * serment et un numéro de carte professionnelle.
 */
export function validateStep(step: number, form: SignupForm): Errors {
  const e: Errors = {};
  const cabinet = form.accountType === "cabinet";

  if (step === 0) {
    if (!form.accountType) {
      e.accountType = "Choisissez le type de compte à créer.";
    }
  }

  if (step === 1) {
    if (cabinet) {
      if (!form.firmName.trim()) {
        e.firmName = "La dénomination du cabinet est obligatoire.";
      } else if (form.firmName.trim().length < 3) {
        e.firmName = "Au moins 3 caractères.";
      }

      if (!form.legalForm) e.legalForm = "Sélectionnez la forme juridique.";

      if (!form.rccm.trim()) {
        e.rccm = "Le numéro RCCM est obligatoire.";
      } else if (!RCCM.test(form.rccm.trim())) {
        e.rccm = "Format attendu : RC/DLA/2019/B/1234.";
      }

      if (!form.foundedOn) {
        e.foundedOn = "Indiquez la date de création.";
      } else if (isFutureDate(form.foundedOn)) {
        e.foundedOn = "La date ne peut pas être dans le futur.";
      }

      if (!form.managerName.trim()) {
        e.managerName = "Nom du représentant légal obligatoire.";
      }
      if (!form.managerRole) e.managerRole = "Précisez sa qualité.";
    } else {
      if (!form.lastName.trim()) e.lastName = "Le nom est obligatoire.";
      if (!form.firstName.trim()) e.firstName = "Le prénom est obligatoire.";

      if (!form.birthDate) {
        e.birthDate = "Indiquez votre date de naissance.";
      } else if (yearsSince(form.birthDate) < 18) {
        e.birthDate = "Vous devez être majeur pour vous inscrire.";
      }
    }

    if (!form.email.trim()) {
      e.email = "L’adresse e-mail est obligatoire.";
    } else if (!EMAIL.test(form.email.trim())) {
      e.email = "Adresse e-mail invalide.";
    }

    if (!form.phone.trim()) {
      e.phone = "Le téléphone est obligatoire.";
    } else if (!PHONE.test(form.phone.replace(/[\s.]/g, ""))) {
      e.phone = "Numéro attendu : 6XX XX XX XX ou +237 6XX XX XX XX.";
    }

    if (!form.password) {
      e.password = "Choisissez un mot de passe.";
    } else if (form.password.length < 8) {
      e.password = "8 caractères minimum.";
    } else if (!/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password)) {
      e.password = "Mélangez au moins une lettre et un chiffre.";
    }

    if (form.passwordConfirm !== form.password) {
      e.passwordConfirm = "Les deux mots de passe diffèrent.";
    }
  }

  if (step === 2) {
    if (!form.bar) e.bar = "Sélectionnez votre barreau.";

    if (cabinet) {
      const n = Number(form.headcount);
      if (!form.headcount.trim()) {
        e.headcount = "Indiquez le nombre d’avocats du cabinet.";
      } else if (!Number.isInteger(n) || n < 1) {
        e.headcount = "Au moins un avocat.";
      } else if (n > 500) {
        e.headcount = "Nombre invraisemblable — vérifiez la saisie.";
      }
    } else {
      if (!form.licenceNumber.trim()) {
        e.licenceNumber = "Le numéro de carte professionnelle est obligatoire.";
      } else if (form.licenceNumber.trim().length < 4) {
        e.licenceNumber = "Numéro trop court.";
      }

      if (!form.oathDate) {
        e.oathDate = "Indiquez votre date de prestation de serment.";
      } else if (isFutureDate(form.oathDate)) {
        e.oathDate = "La date ne peut pas être dans le futur.";
      }

      const years = Number(form.experienceYears);
      if (!form.experienceYears.trim()) {
        e.experienceYears = "Indiquez vos années d’exercice.";
      } else if (!Number.isInteger(years) || years < 0) {
        e.experienceYears = "Saisissez un nombre entier d’années.";
      } else if (form.oathDate && years > Math.ceil(yearsSince(form.oathDate))) {
        e.experienceYears = "Plus d’années que depuis votre prestation de serment.";
      }
    }

    const max = cabinet ? 8 : 5;
    if (form.specialties.length === 0) {
      e.specialties = "Sélectionnez au moins un domaine.";
    } else if (form.specialties.length > max) {
      e.specialties = `${max} domaines au maximum, pour rester lisible.`;
    }

    if (form.languages.length === 0) {
      e.languages = "Sélectionnez au moins une langue de travail.";
    }
  }

  if (step === 3) {
    if (!form.city) e.city = "Sélectionnez votre ville.";
    if (!form.district.trim()) e.district = "Indiquez le quartier.";

    if (!form.address.trim()) {
      e.address = cabinet
        ? "L’adresse du cabinet est obligatoire."
        : "L’adresse professionnelle est obligatoire.";
    }

    if (form.website.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(form.website.trim())) {
      e.website = "Adresse de site invalide (ex. cabinet-fokou.cm).";
    }
  }

  /*
   * L'étape 4 (justificatifs) ne bloque rien, volontairement.
   *
   * Exiger les pièces ici faisait abandonner le parcours à qui n'avait pas ses
   * scans sous la main. Le compte se crée désormais sans elles ; l'avocat les
   * dépose quand il veut depuis son espace, et la vérification par le Barreau
   * — donc la mise en ligne de la vitrine — reste conditionnée à leur remise,
   * côté administration. Rien n'est perdu, seul le moment change.
   */


  if (step === 5) {
    if (!form.plan) e.plan = "Choisissez une formule.";

    if (!form.acceptCharter) {
      e.acceptCharter = "L’adhésion à la charte déontologique est obligatoire.";
    }
    if (!form.acceptTerms) {
      e.acceptTerms = "Vous devez accepter les conditions générales.";
    }
    if (!form.acceptData) {
      e.acceptData = "Le consentement au traitement des données est obligatoire.";
    }
  }

  return e;
}

/* -------------------------------------------------------------------------- */
/* Erreurs venues du serveur                                                  */
/* -------------------------------------------------------------------------- */

/** Champs traités par chaque étape, dans l'ordre du parcours. */
const fieldsByStep: string[][] = [
  ["accountType"],
  [
    "firmName",
    "legalForm",
    "rccm",
    "foundedOn",
    "managerName",
    "managerRole",
    "lastName",
    "firstName",
    "birthDate",
    "email",
    "phone",
    "password",
    "passwordConfirm",
  ],
  ["bar", "headcount", "licenceNumber", "oathDate", "experienceYears", "specialties", "languages"],
  ["city", "district", "address", "poBox", "website"],
  [],
  ["plan", "acceptCharter", "acceptTerms", "acceptData"],
];

/**
 * Retrouve l'étape qui porte un champ donné.
 *
 * Le serveur revalide tout le formulaire d'un coup : il peut donc signaler une
 * adresse e-mail déjà prise alors que le visiteur se trouve sur la dernière
 * étape. Sans cette correspondance, il verrait un message d'erreur sans jamais
 * apercevoir le champ concerné.
 *
 * @returns L'index de l'étape, ou -1 si le champ est inconnu.
 */
export function stepOfField(field: string): number {
  return fieldsByStep.findIndex((fields) => fields.includes(field));
}

/**
 * Étape la plus précoce parmi un ensemble d'erreurs renvoyées par le serveur.
 *
 * @returns L'index de l'étape à rouvrir, ou -1 si aucune ne correspond.
 */
export function firstStepWithError(errors: Errors): number {
  const steps = Object.keys(errors)
    .map(stepOfField)
    .filter((index) => index >= 0);

  return steps.length > 0 ? Math.min(...steps) : -1;
}
