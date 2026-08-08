/**
 * Conversion de la vitrine renvoyée par l'API vers le type `LawyerProfile`
 * utilisé par les composants.
 *
 * Le plugin renvoie déjà la bonne forme : ce module ne renomme rien, il
 * garantit les invariants que le typage seul ne peut pas assurer. Une vitrine
 * fraîchement créée n'a ni prestation, ni album, ni guide ; sans valeurs de
 * repli, le premier `.filter()` de l'espace praticien planterait sur
 * `undefined`.
 */

import type {
  FactIcon,
  GalleryAlbum,
  LawyerProfile,
  Prestation,
  ProfileGuide,
  ProfileReview,
  Tone,
} from "@/lib/data/lawyer-profile";

const TONES: Tone[] = ["marine", "gold", "trust", "night", "sand"];

const FACT_ICONS: FactIcon[] = [
  "scale",
  "mapPin",
  "building",
  "award",
  "clock",
  "globe",
  "calendar",
  "users",
];

const PRESTATION_MODES: Prestation["mode"][] = ["visio", "cabinet", "telephone", "document"];

/**
 * Construit un `LawyerProfile` complet à partir de la charge utile de l'API.
 *
 * @param raw Objet `profile` de GET /auth/me ou GET /lawyers/{slug}.
 * @returns Un profil exploitable, ou null si la charge utile est inutilisable.
 */
export function toLawyerProfile(raw: unknown): LawyerProfile | null {
  if (!isRecord(raw) || typeof raw.slug !== "string" || raw.slug === "") {
    return null;
  }

  const type = raw.type === "cabinet" ? "cabinet" : "individuel";
  const name = str(raw.name);

  const profile: LawyerProfile = {
    slug: raw.slug,
    type,
    name,
    subtitle: str(raw.subtitle),
    initials: str(raw.initials) || initialsFrom(name),
    coverTone: oneOf(raw.coverTone, TONES, type === "cabinet" ? "marine" : "night"),
    avatarUrl: url(raw.avatarUrl),
    coverUrl: url(raw.coverUrl),
    isPublished: raw.isPublished === true,
    headline: str(raw.headline),
    about: strings(raw.about),

    bar: str(raw.bar),
    city: str(raw.city),
    district: str(raw.district),
    address: str(raw.address),
    website: str(raw.website),
    memberSince: str(raw.memberSince),

    rating: num(raw.rating),
    reviewsCount: num(raw.reviewsCount),
    consultations: str(raw.consultations) || "0",
    responseTime: str(raw.responseTime),
    plan: oneOf(raw.plan, ["essentiel", "premium", "pionnier"] as const, "essentiel"),

    specialties: strings(raw.specialties),
    languages: strings(raw.languages),
    facts: list(raw.facts).flatMap((item) =>
      isRecord(item) ? [{ icon: oneOf(item.icon, FACT_ICONS, "scale"), label: str(item.label) }] : [],
    ),

    prestations: list(raw.prestations).flatMap(toPrestation),
    albums: list(raw.albums).flatMap(toAlbum),
    guides: list(raw.guides).flatMap(toGuide),
    reviews: list(raw.reviews).flatMap(toReview),
  };

  if (type === "cabinet") {
    profile.team = list(raw.team).flatMap((item) =>
      isRecord(item)
        ? [
            {
              name: str(item.name),
              initials: str(item.initials) || initialsFrom(str(item.name)),
              role: str(item.role),
              specialty: str(item.specialty),
            },
          ]
        : [],
    );
    profile.legalForm = str(raw.legalForm);
    profile.rccm = str(raw.rccm);
    profile.headcount = num(raw.headcount);
  } else {
    profile.milestones = list(raw.milestones).flatMap((item) =>
      isRecord(item)
        ? [{ year: str(item.year), label: str(item.label), place: str(item.place) }]
        : [],
    );
  }

  return profile;
}

/* -------------------------------------------------------------------------- */
/* Conversions par bloc                                                       */
/* -------------------------------------------------------------------------- */

function toPrestation(item: unknown): Prestation[] {
  if (!isRecord(item)) return [];

  return [
    {
      id: str(item.id),
      title: str(item.title),
      description: str(item.description),
      price: num(item.price),
      unit: str(item.unit),
      mode: oneOf(item.mode, PRESTATION_MODES, "visio"),
      popular: item.popular === true,
    },
  ];
}

function toAlbum(item: unknown): GalleryAlbum[] {
  if (!isRecord(item)) return [];

  return [
    {
      id: str(item.id),
      title: str(item.title),
      description: str(item.description),
      updatedAt: str(item.updatedAt),
      photos: list(item.photos).flatMap((photo) =>
        isRecord(photo)
          ? [
              {
                id: str(photo.id),
                caption: str(photo.caption),
                tone: oneOf(photo.tone, TONES, "marine"),
                url: url(photo.url),
              },
            ]
          : [],
      ),
    },
  ];
}

function toGuide(item: unknown): ProfileGuide[] {
  if (!isRecord(item)) return [];

  return [
    {
      id: str(item.id),
      slug: str(item.slug),
      kind: item.kind === "modele" ? "modele" : "guide",
      format: item.format === "texte" ? "texte" : "pdf",
      title: str(item.title),
      description: str(item.description),
      category: str(item.category),
      price: num(item.price),
      free: item.free === true || num(item.price) === 0,
      pages: num(item.pages),
      views: num(item.views),
      readingTime: Math.max(1, num(item.readingTime)),
      // L'API renvoie un nombre déjà mis en forme (« 4 015 ») ; le type attend
      // une chaîne, et « — » reste la marque d'un guide jamais téléchargé.
      downloads: str(item.downloads) || "—",
      status: item.status === "publie" ? "publie" : "brouillon",
      coverUrl: url(item.coverUrl),
      hasFile: item.hasFile === true,
      fileName: str(item.fileName),
      fileSize: num(item.fileSize),
      updatedAt: str(item.updatedAt),
      // Contenu et lien du PDF : présents seulement quand l'API répond au
      // propriétaire du guide. Sur une vitrine publique, ils sont absents.
      content: str(item.content),
      fileUrl: url(item.fileUrl),
    },
  ];
}

function toReview(item: unknown): ProfileReview[] {
  if (!isRecord(item)) return [];

  const author = str(item.author);
  const reply = str(item.reply);

  return [
    {
      id: str(item.id),
      author,
      initials: str(item.initials) || initialsFrom(author),
      // Une note hors bornes casserait l'affichage des étoiles.
      rating: Math.min(5, Math.max(0, Math.round(num(item.rating)))),
      date: str(item.date),
      context: str(item.context),
      quote: str(item.quote),
      ...(reply ? { reply } : {}),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

/**
 * Normalise une URL de média.
 *
 * Le plugin renvoie `null` quand aucun fichier n'est attaché ; les composants
 * testent la présence de l'URL pour choisir entre la photo et l'aplat de repli.
 * Une chaîne vide passerait ce test et afficherait une image cassée.
 */
function url(value: unknown): string | null {
  const text = str(value).trim();

  return text !== "" ? text : null;
}

function num(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function strings(value: unknown): string[] {
  return list(value)
    .map(str)
    .filter((entry) => entry !== "");
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Deux initiales, en retirant la civilité (« Me Nadège Fokou » → NF). */
function initialsFrom(name: string): string {
  const words = name
    .replace(/^(Me|Maître|Cabinet|SCP)\s+/i, "")
    .split(/[\s\-’']+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";

  return (first + last).toUpperCase();
}
