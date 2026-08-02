/**
 * Vitrines publiques des avocats et des cabinets.
 *
 * Contenu de démonstration : chaque profil correspond à un enregistrement de
 * l'annuaire (module 2.1) enrichi des éléments de vitrine — galerie, guides
 * publiés, prestations et avis. Les visuels ne sont pas encore disponibles :
 * les photos sont représentées par un aplat dégradé et une légende, prêtes à
 * être remplacées par un <Image /> une fois le stockage S3/R2 branché.
 */

export type ProfileType = "individuel" | "cabinet";

/** Teinte de l'aplat qui tient lieu de photo. */
export type Tone = "marine" | "gold" | "trust" | "night" | "sand";

export type GalleryPhoto = {
  id: string;
  caption: string;
  tone: Tone;
  /** Visuel téléversé. Absent tant que la photo n'est qu'un aplat de couleur. */
  url?: string | null;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  photos: GalleryPhoto[];
};

export type Prestation = {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  mode: "visio" | "cabinet" | "telephone" | "document";
  popular?: boolean;
};

/** Support de livraison : un PDF déposé, ou un texte rédigé en ligne. */
export type GuideFormat = "pdf" | "texte";

export type ProfileGuide = {
  /** Identifiant technique — absent des profils de démonstration. */
  id?: string;
  slug: string;
  kind: "guide" | "modele";
  format: GuideFormat;
  title: string;
  description: string;
  category: string;
  price: number;
  pages: number;
  downloads: string;
  status: "publie" | "brouillon";
  coverUrl?: string | null;
  hasFile?: boolean;
  fileName?: string;
  fileSize?: number;
  updatedAt?: string;
  /** Contenu rédigé, HTML assaini. Réservé au propriétaire. */
  content?: string;
  /** Lien signé et expirant vers le PDF. Réservé au propriétaire. */
  fileUrl?: string | null;
};

export type ProfileReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  context: string;
  quote: string;
  reply?: string;
};

export type TeamMember = {
  name: string;
  initials: string;
  role: string;
  specialty: string;
};

export type Milestone = {
  year: string;
  label: string;
  place: string;
};

export type LawyerProfile = {
  slug: string;
  type: ProfileType;
  name: string;
  /** Ligne grise entre parenthèses, sous le nom, comme sur la maquette. */
  subtitle: string;
  initials: string;
  coverTone: Tone;
  /** Portrait téléversé ; à défaut, les initiales tiennent lieu d'avatar. */
  avatarUrl?: string | null;
  /** Bandeau téléversé ; à défaut, l'aplat dégradé de `coverTone`. */
  coverUrl?: string | null;
  /** Faux tant que l'équipe de vérification n'a pas validé le compte. */
  isPublished?: boolean;
  headline: string;
  about: string[];

  bar: string;
  city: string;
  district: string;
  address: string;
  website: string;
  memberSince: string;

  rating: number;
  reviewsCount: number;
  consultations: string;
  responseTime: string;
  /** Reprend les identifiants de `plans` (lib/avocats/signup.ts). */
  plan: "essentiel" | "premium" | "pionnier";

  specialties: string[];
  languages: string[];
  /** Bloc « Informations professionnelles » de la colonne de gauche. */
  facts: { icon: FactIcon; label: string }[];

  prestations: Prestation[];
  albums: GalleryAlbum[];
  guides: ProfileGuide[];
  reviews: ProfileReview[];

  /** Avocat indépendant uniquement. */
  milestones?: Milestone[];
  /** Cabinet uniquement. */
  team?: TeamMember[];
  legalForm?: string;
  rccm?: string;
  headcount?: number;
};

export type FactIcon =
  | "scale"
  | "mapPin"
  | "building"
  | "award"
  | "clock"
  | "globe"
  | "calendar"
  | "users";

/* -------------------------------------------------------------------------- */
/* Avocat indépendant                                                         */
/* -------------------------------------------------------------------------- */

const nadegeFokou: LawyerProfile = {
  slug: "nadege-fokou",
  type: "individuel",
  name: "Me Nadège Fokou",
  subtitle: "Droit des affaires & fiscal",
  initials: "NF",
  coverTone: "night",
  headline:
    "J’accompagne les entrepreneurs camerounais de la création de leur société à leurs premiers contentieux.",
  about: [
    "Avocate au Barreau du Littoral depuis 2011, j’interviens principalement en droit des sociétés, en fiscalité d’entreprise et en recouvrement de créances.",
    "Mon cabinet reçoit aussi bien des commerçants qui formalisent leur activité que des PME confrontées à un contrôle fiscal. Je crois qu’un client informé se défend mieux : c’est pourquoi je publie des guides accessibles à 250 FCFA.",
  ],

  bar: "Barreau du Littoral",
  city: "Douala",
  district: "Bonanjo",
  address: "Immeuble Vieira, 3e étage, rue Joss",
  website: "cabinet-fokou.cm",
  memberSince: "mars 2024",

  rating: 4.9,
  reviewsCount: 127,
  consultations: "310",
  responseTime: "~1 h",
  plan: "pionnier",

  specialties: [
    "Droit des affaires",
    "Droit fiscal",
    "Droit des contrats",
    "Recouvrement de créances",
  ],
  languages: ["Français", "Anglais"],

  facts: [
    { icon: "scale", label: "Avocate au Barreau du Littoral" },
    { icon: "mapPin", label: "Exerce à Bonanjo, Douala" },
    { icon: "award", label: "Prestation de serment en 2011" },
    { icon: "calendar", label: "14 ans d’expérience" },
    { icon: "globe", label: "Français, Anglais" },
    { icon: "clock", label: "Répond en moyenne en 1 heure" },
  ],

  milestones: [
    { year: "2011", label: "Prestation de serment", place: "Barreau du Littoral" },
    { year: "2014", label: "Collaboratrice en droit fiscal", place: "Cabinet Mvondo & Associés" },
    { year: "2018", label: "Ouverture de son cabinet", place: "Bonanjo, Douala" },
    { year: "2023", label: "Formatrice en droit OHADA", place: "Chambre de commerce du Littoral" },
  ],

  prestations: [
    {
      id: "premiere-consultation",
      title: "Première consultation",
      description:
        "30 minutes pour qualifier votre situation et vous dire, franchement, si une procédure vaut le coup.",
      price: 10000,
      unit: "30 min",
      mode: "visio",
      popular: true,
    },
    {
      id: "creation-societe",
      title: "Création de société (SARL)",
      description:
        "Rédaction des statuts, dépôt au greffe et immatriculation, honoraires forfaitaires.",
      price: 250000,
      unit: "forfait",
      mode: "cabinet",
    },
    {
      id: "relecture-contrat",
      title: "Relecture de contrat",
      description:
        "Analyse écrite d’un contrat de moins de 20 pages, avec les clauses à renégocier.",
      price: 45000,
      unit: "par contrat",
      mode: "document",
    },
    {
      id: "mise-en-demeure",
      title: "Mise en demeure & recouvrement",
      description:
        "Courrier recommandé sur papier à en-tête du cabinet, puis suivi de la procédure.",
      price: 75000,
      unit: "par dossier",
      mode: "document",
    },
  ],

  albums: [
    {
      id: "cabinet",
      title: "Le cabinet",
      description: "Les locaux de Bonanjo, où se tiennent les rendez-vous.",
      updatedAt: "il y a 2 semaines",
      photos: [
        { id: "c1", caption: "Salle d’attente", tone: "sand" },
        { id: "c2", caption: "Bureau principal", tone: "marine" },
        { id: "c3", caption: "Salle de réunion", tone: "night" },
        { id: "c4", caption: "Bibliothèque juridique", tone: "gold" },
      ],
    },
    {
      id: "vie-professionnelle",
      title: "Vie professionnelle",
      description: "Conférences, formations et prestations de serment.",
      updatedAt: "il y a 1 mois",
      photos: [
        { id: "v1", caption: "Prestation de serment, 2011", tone: "night" },
        { id: "v2", caption: "Conférence OHADA, Douala 2024", tone: "marine" },
        { id: "v3", caption: "Formation Chambre de commerce", tone: "gold" },
        { id: "v4", caption: "Rentrée solennelle du Barreau", tone: "trust" },
        { id: "v5", caption: "Table ronde fiscalité PME", tone: "sand" },
      ],
    },
    {
      id: "equipe",
      title: "L’équipe",
      description: "Les collaborateurs qui suivent vos dossiers au quotidien.",
      updatedAt: "il y a 3 mois",
      photos: [
        { id: "e1", caption: "Assistante juridique", tone: "marine" },
        { id: "e2", caption: "Stagiaire, promotion 2025", tone: "sand" },
        { id: "e3", caption: "Réunion hebdomadaire", tone: "gold" },
      ],
    },
  ],

  guides: [
    {
      slug: "creer-sarl-formalites",
      kind: "guide",
      format: "pdf",
      title: "Créer sa SARL : formalités, délais et coûts réels",
      description:
        "Le parcours complet, du dépôt des statuts au RCCM, avec les frais réels constatés à Douala et les pièges qui font rejeter un dossier.",
      category: "Droit des affaires",
      price: 250,
      pages: 18,
      downloads: "4 015",
      status: "publie",
      hasFile: true,
    },
    {
      slug: "controle-fiscal-pme",
      kind: "guide",
      format: "pdf",
      title: "Contrôle fiscal d’une PME : les 5 erreurs qui coûtent cher",
      description:
        "Ce que l’administration vérifie en priorité, les délais de réponse à ne pas laisser passer, et la conduite à tenir dès la notification.",
      category: "Droit fiscal",
      price: 250,
      pages: 14,
      downloads: "2 780",
      status: "publie",
      hasFile: true,
    },
    {
      slug: "modele-mise-en-demeure",
      kind: "modele",
      format: "pdf",
      title: "Mise en demeure de payer — modèle commenté",
      description:
        "Le modèle prêt à adapter, annoté paragraphe par paragraphe : ce qui engage, ce qui se négocie, ce qu’il ne faut jamais écrire.",
      category: "Recouvrement",
      price: 500,
      pages: 4,
      downloads: "1 940",
      status: "publie",
      hasFile: true,
    },
    {
      slug: "pacte-associes",
      kind: "modele",
      format: "texte",
      title: "Pacte d’associés : le modèle que j’utilise au cabinet",
      description:
        "Clauses d’agrément, sortie conjointe, répartition des dividendes : la trame que je fais signer, expliquée clause par clause.",
      category: "Droit des affaires",
      price: 500,
      pages: 9,
      downloads: "—",
      status: "brouillon",
    },
  ],

  reviews: [
    {
      id: "r1",
      author: "Emmanuel T.",
      initials: "ET",
      rating: 5,
      date: "il y a 3 semaines",
      context: "Création de SARL",
      quote:
        "Tout a été dit dès le premier rendez-vous : le coût réel, les délais, ce que je devais préparer. Aucune mauvaise surprise sur la facture finale.",
      reply:
        "Merci Emmanuel. Bonne continuation à votre société — n’hésitez pas pour le pacte d’associés.",
    },
    {
      id: "r2",
      author: "Sandrine M.",
      initials: "SM",
      rating: 5,
      date: "il y a 2 mois",
      context: "Contrôle fiscal",
      quote:
        "J’ai acheté son guide à 250 FCFA avant de la contacter. Le guide m’avait déjà évité une erreur de procédure ; la consultation a fait le reste.",
    },
    {
      id: "r3",
      author: "Ibrahim N.",
      initials: "IN",
      rating: 4,
      date: "il y a 4 mois",
      context: "Recouvrement de créance",
      quote:
        "Réponse très rapide, honoraires annoncés à l’avance. J’aurais aimé un peu plus de suivi entre deux échéances, mais le dossier a abouti.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Cabinet                                                                    */
/* -------------------------------------------------------------------------- */

const cabinetNdongo: LawyerProfile = {
  slug: "cabinet-ndongo-associes",
  type: "cabinet",
  name: "Cabinet Ndongo & Associés",
  subtitle: "Droit foncier & immobilier",
  initials: "NA",
  coverTone: "marine",
  headline:
    "Six avocats réunis autour d’une spécialité : sécuriser les transactions foncières au Cameroun.",
  about: [
    "Fondé en 2009 à Yaoundé, le cabinet Ndongo & Associés est né d’un constat simple : la double vente de terrain est le contentieux le plus courant du pays, et le plus évitable.",
    "Nous intervenons en amont — vérification de titre, rédaction d’acte, bornage — comme en contentieux devant les tribunaux de grande instance. Chaque dossier est suivi par un avocat référent, joignable directement.",
  ],

  bar: "Barreau du Centre",
  city: "Yaoundé",
  district: "Bastos",
  address: "Rue 1750, immeuble Le Palmier, 2e étage",
  website: "ndongo-associes.cm",
  memberSince: "janvier 2024",

  rating: 4.8,
  reviewsCount: 94,
  consultations: "520",
  responseTime: "~2 h",
  plan: "premium",

  specialties: [
    "Droit foncier & immobilier",
    "Droit des contrats",
    "Droit de la construction",
    "Succession",
    "Droit rural",
  ],
  languages: ["Français", "Anglais", "Langues locales"],

  facts: [
    { icon: "building", label: "Société civile professionnelle (SCP)" },
    { icon: "scale", label: "Inscrit au Barreau du Centre" },
    { icon: "users", label: "6 avocats collaborateurs" },
    { icon: "mapPin", label: "Bastos, Yaoundé" },
    { icon: "calendar", label: "Cabinet fondé en 2009" },
    { icon: "globe", label: "Français, Anglais, langues locales" },
  ],

  legalForm: "Société civile professionnelle (SCP)",
  rccm: "RC/YAO/2009/B/0871",
  headcount: 6,

  team: [
    {
      name: "Me Serge Ndongo",
      initials: "SN",
      role: "Associé fondateur",
      specialty: "Droit foncier",
    },
    {
      name: "Me Rachelle Ewané",
      initials: "RE",
      role: "Associée",
      specialty: "Contentieux & procédure",
    },
    {
      name: "Me Patrick Kamdem",
      initials: "PK",
      role: "Collaborateur",
      specialty: "Droit des contrats",
    },
    {
      name: "Me Aline Bidjeck",
      initials: "AB",
      role: "Collaboratrice",
      specialty: "Successions",
    },
  ],

  prestations: [
    {
      id: "verification-titre",
      title: "Vérification d’un titre foncier",
      description:
        "Contrôle à la conservation foncière avant achat : origine du titre, charges, litiges en cours.",
      price: 35000,
      unit: "par titre",
      mode: "document",
      popular: true,
    },
    {
      id: "acte-vente",
      title: "Rédaction d’un acte de vente",
      description:
        "Acte sécurisé, accompagnement jusqu’à la mutation du titre au nom de l’acquéreur.",
      price: 180000,
      unit: "forfait",
      mode: "cabinet",
    },
    {
      id: "consultation-fonciere",
      title: "Consultation foncière",
      description:
        "45 minutes avec l’avocat référent pour situer votre dossier et arrêter une stratégie.",
      price: 15000,
      unit: "45 min",
      mode: "visio",
    },
    {
      id: "contentieux-bornage",
      title: "Contentieux de bornage",
      description:
        "Représentation devant le tribunal, honoraires au forfait pour la première instance.",
      price: 450000,
      unit: "1re instance",
      mode: "cabinet",
    },
  ],

  albums: [
    {
      id: "locaux",
      title: "Nos locaux",
      description: "L’immeuble Le Palmier à Bastos et nos salles de réception.",
      updatedAt: "il y a 1 semaine",
      photos: [
        { id: "l1", caption: "Façade, immeuble Le Palmier", tone: "marine" },
        { id: "l2", caption: "Accueil", tone: "sand" },
        { id: "l3", caption: "Grande salle de réunion", tone: "night" },
        { id: "l4", caption: "Bureau des associés", tone: "gold" },
      ],
    },
    {
      id: "equipe",
      title: "L’équipe",
      description: "Les six avocats et l’équipe administrative.",
      updatedAt: "il y a 3 semaines",
      photos: [
        { id: "t1", caption: "Les associés fondateurs", tone: "night" },
        { id: "t2", caption: "Réunion de dossiers", tone: "marine" },
        { id: "t3", caption: "Pôle contentieux", tone: "trust" },
        { id: "t4", caption: "Équipe administrative", tone: "sand" },
      ],
    },
    {
      id: "terrain",
      title: "Sur le terrain",
      description: "Bornages, descentes et audiences.",
      updatedAt: "il y a 2 mois",
      photos: [
        { id: "s1", caption: "Bornage à Nkolbisson", tone: "trust" },
        { id: "s2", caption: "Descente contradictoire", tone: "gold" },
        { id: "s3", caption: "Tribunal de grande instance", tone: "marine" },
      ],
    },
  ],

  guides: [
    {
      slug: "acheter-terrain-securite",
      kind: "guide",
      format: "pdf",
      title: "Les étapes légales pour acheter un terrain en toute sécurité",
      description:
        "Les vérifications à mener avant de signer : titre foncier, bornage, droits coutumiers, et les cinq documents à exiger du vendeur.",
      category: "Droit foncier",
      price: 250,
      pages: 15,
      downloads: "3 120",
      status: "publie",
      hasFile: true,
    },
    {
      slug: "litige-bailleur",
      kind: "guide",
      format: "pdf",
      title: "Que faire en cas de litige avec son bailleur ?",
      description:
        "Loyers impayés, expulsion, caution retenue : vos droits et la procédure à suivre, avec les courriers types à envoyer.",
      category: "Droit foncier",
      price: 250,
      pages: 12,
      downloads: "2 340",
      status: "publie",
      hasFile: true,
    },
    {
      slug: "double-vente-terrain",
      kind: "guide",
      format: "pdf",
      title: "Double vente : comment protéger votre titre foncier",
      description:
        "Reconnaître une double vente à temps, sécuriser sa position, et engager l’action qui fait primer votre titre devant le tribunal.",
      category: "Contentieux",
      price: 250,
      pages: 16,
      downloads: "1 610",
      status: "publie",
      hasFile: true,
    },
  ],

  reviews: [
    {
      id: "cr1",
      author: "Joséphine A.",
      initials: "JA",
      rating: 5,
      date: "il y a 1 mois",
      context: "Vérification de titre",
      quote:
        "Ils ont découvert que le terrain que j’allais acheter était déjà hypothéqué. 35 000 FCFA qui m’ont évité de perdre huit millions.",
      reply:
        "C’est exactement à cela que sert la vérification. Merci de votre confiance.",
    },
    {
      id: "cr2",
      author: "Marc-Aurèle K.",
      initials: "MK",
      rating: 5,
      date: "il y a 2 mois",
      context: "Contentieux de bornage",
      quote:
        "Dossier suivi par un avocat référent joignable directement, sans passer par un secrétariat. Ça change tout quand une audience approche.",
    },
    {
      id: "cr3",
      author: "Pauline E.",
      initials: "PE",
      rating: 4,
      date: "il y a 5 mois",
      context: "Succession",
      quote:
        "Compétents et pédagogues. Les délais ont été plus longs qu’annoncé, mais le partage a été validé sans contestation.",
    },
  ],
};

/* -------------------------------------------------------------------------- */

export const lawyerProfiles: Record<string, LawyerProfile> = {
  [nadegeFokou.slug]: nadegeFokou,
  [cabinetNdongo.slug]: cabinetNdongo,
};

export function getProfile(slug: string) {
  return lawyerProfiles[slug];
}

/** Profil piloté depuis l'espace de gestion (démonstration). */
export const managedProfile = nadegeFokou;
