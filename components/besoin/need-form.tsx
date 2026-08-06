"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { CheckboxField, Field, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { postJson } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { CommunityNeed, Conversation } from "@/lib/api/types";
import {
  IconAlert,
  IconIncognito,
  IconLock,
  IconScale,
  IconSend,
  IconUsers,
} from "@/components/ui/icons";

/** Le cabinet visé, quand le formulaire est ouvert depuis une vitrine. */
export type NeedTarget = {
  slug: string;
  name: string;
  initials: string;
  subtitle: string;
  city: string;
  avatarUrl?: string | null;
};

/**
 * Niveaux d'urgence — repris mot pour mot de TAL_Needs::urgencies().
 *
 * Dupliqués ici plutôt que chargés : ce sont quatre chaînes qui ne bougeront
 * pas, et un aller-retour pour les obtenir retarderait l'affichage du
 * formulaire. Si elles divergent un jour, c'est le backend qui tranche — il
 * retombe sur « normal » pour toute valeur qu'il ne connaît pas.
 */
const URGENCIES = [
  { value: "normal", label: "Pas d’urgence particulière" },
  { value: "semaine", label: "Dans la semaine" },
  { value: "urgent", label: "Urgent — sous 48 heures" },
  { value: "tres_urgent", label: "Très urgent — délai légal en cours" },
];

const MIN_BODY = 30;

/**
 * « Poser mon problème » — le formulaire unique, dans ses deux régimes.
 *
 * Un seul écrit, deux destinations possibles :
 *
 *  - **la communauté** : le problème est publié, tout le monde peut y répondre,
 *    et les réponses d'avocats vérifiés portent leur badge ;
 *  - **un cabinet** : le problème n'est vu que de lui, et ouvre une conversation
 *    privée entre les deux parties.
 *
 * Le choix est présenté avant les champs, et non après : il change ce que
 * l'auteur peut écrire (l'anonymat n'a aucun sens dans un échange privé), et le
 * découvrir au moment d'envoyer obligerait à relire son texte.
 */
export function NeedForm({
  signedIn,
  target,
  specialties,
  cities,
  defaultSpecialty = "",
}: {
  /** Un citoyen est connecté : le dépôt est possible. */
  signedIn: boolean;
  /** Cabinet visé, quand la page est ouverte depuis une vitrine. */
  target?: NeedTarget | null;
  specialties: string[];
  cities: string[];
  /** Domaine pré-sélectionné, quand on arrive d'une page de domaine. */
  defaultSpecialty?: string;
}) {
  const router = useRouter();
  const { run, reset, pending, error, errors } = useAdminAction();

  const [scope, setScope] = useState<"public" | "prive">(target ? "prive" : "public");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [budget, setBudget] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const remaining = Math.max(0, MIN_BODY - body.trim().length);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    await run(
      () =>
        postJson<{ need: CommunityNeed; conversation?: Conversation }>("/api/besoins", {
          scope,
          lawyer: scope === "prive" ? (target?.slug ?? "") : "",
          title: title.trim(),
          body: body.trim(),
          specialty,
          city,
          urgency,
          budget: budget.trim(),
          // Un échange privé n'a personne à qui se cacher : le cabinet doit
          // savoir à qui il répond.
          is_anonymous: scope === "public" ? anonymous : false,
        }),
      (data) => {
        if (!data) return;

        // La conversation prime quand elle existe : c'est là que la réponse
        // arrivera, et c'est donc là que l'auteur doit atterrir.
        router.push(
          data.conversation
            ? `/messages/${data.conversation.id}`
            : `/communaute/${data.need.slug}`,
        );
      },
    );
  }

  if (!signedIn) {
    return <SignedOutNotice target={target} />;
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {/* ---------------- Destination ---------------- */}
      <fieldset>
        <legend className="font-serif text-lg font-bold text-marine-950">
          À qui posez-vous la question ?
        </legend>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ScopeCard
            selected={scope === "public"}
            onSelect={() => {
              setScope("public");
              reset();
            }}
            icon={<IconUsers className="size-5" />}
            title="À la communauté"
            description="Votre problème est publié. Membres et avocats vérifiés peuvent y répondre, et les réponses restent visibles pour ceux qui vivront la même situation."
          />

          <ScopeCard
            selected={scope === "prive"}
            onSelect={() => {
              if (!target) return;
              setScope("prive");
              reset();
            }}
            disabled={!target}
            icon={<IconLock className="size-5" />}
            title={target ? `À ${target.name}` : "À un cabinet précis"}
            description={
              target
                ? "Personne d’autre ne le lira. Une conversation privée s’ouvre avec ce cabinet."
                : "Choisissez d’abord un cabinet dans l’annuaire : le bouton « Décrire mon besoin » de sa fiche ouvre ce formulaire."
            }
          />
        </div>

        {scope === "prive" && target && <TargetCard target={target} />}

        {scope === "public" && !target && (
          <p className="mt-3 text-sm/relaxed text-marine-600">
            Vous préférez vous adresser à quelqu’un en particulier ?{" "}
            <Link href="/avocats" className="font-semibold text-gold-700 hover:text-gold-800">
              Parcourez l’annuaire
            </Link>{" "}
            et ouvrez ce formulaire depuis sa fiche.
          </p>
        )}
      </fieldset>

      {/* ---------------- Le problème ---------------- */}
      <div className="space-y-5 border-t border-marine-950/8 pt-6">
        <Field
          label="Résumez votre situation"
          htmlFor="besoin-titre"
          required
          hint="Une phrase, comme un titre. « Mon employeur refuse de me remettre mon certificat de travail »."
          error={errors.title}
        >
          <TextInput
            id="besoin-titre"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="En quelques mots…"
            maxLength={190}
            invalid={Boolean(errors.title)}
          />
        </Field>

        <Field
          label="Racontez ce qui s’est passé"
          htmlFor="besoin-texte"
          required
          hint="Dates, courriers reçus, démarches déjà faites. N’écrivez ni votre numéro de pièce d’identité ni vos coordonnées bancaires."
          error={errors.body}
        >
          <TextArea
            id="besoin-texte"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Décrivez les faits dans l’ordre où ils se sont produits…"
            className="min-h-48"
            invalid={Boolean(errors.body)}
          />
        </Field>

        {/* Le compteur ne parle que tant qu'il manque quelque chose : afficher
            « 412 caractères » à quelqu'un qui a fini n'apporte rien. */}
        {remaining > 0 && (
          <p className="-mt-3 text-xs text-marine-500">
            Encore {remaining} caractère{remaining > 1 ? "s" : ""} pour que votre
            demande soit exploitable.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Domaine du droit" htmlFor="besoin-domaine" optional error={errors.specialty}>
            <SelectInput
              id="besoin-domaine"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="">Je ne sais pas</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Votre ville" htmlFor="besoin-ville" optional error={errors.city}>
            <SelectInput
              id="besoin-ville"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">Non précisée</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Délai" htmlFor="besoin-urgence" optional>
            <SelectInput
              id="besoin-urgence"
              value={urgency}
              onChange={(event) => setUrgency(event.target.value)}
            >
              {URGENCIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field
            label="Budget envisagé"
            htmlFor="besoin-budget"
            optional
            hint="Annoncer une fourchette évite les propositions hors de portée."
          >
            <TextInput
              id="besoin-budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="50 000 – 150 000 FCFA"
              maxLength={60}
            />
          </Field>
        </div>

        {scope === "public" && (
          <CheckboxField
            id="besoin-anonyme"
            checked={anonymous}
            onChange={setAnonymous}
            label={
              <span className="flex items-center gap-2">
                <IconIncognito className="size-4 text-marine-500" />
                Publier sous « Membre »
              </span>
            }
            description="Votre pseudonyme n’apparaîtra pas sur le fil. Décochez pour signer votre message."
          />
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm/relaxed text-danger-700"
        >
          <IconAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-marine-950/8 pt-6">
        <button type="submit" disabled={pending} className={buttonStyles({ size: "lg" })}>
          <IconSend className="size-4.5" />
          {pending
            ? "Envoi…"
            : scope === "prive"
              ? "Envoyer au cabinet"
              : "Publier mon problème"}
        </button>

        <p className="text-xs/relaxed text-marine-500">
          {scope === "prive"
            ? "Réponse attendue sous 48 heures ouvrées."
            : "Aucune réponse publiée ici ne remplace une consultation."}
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function ScopeCard({
  selected,
  onSelect,
  disabled = false,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex h-full flex-col rounded-2xl border-2 p-5 text-left transition-all duration-200",
        disabled && "cursor-not-allowed opacity-60",
        selected
          ? "border-gold-500 bg-gold-50/60 shadow-card"
          : "border-marine-950/10 bg-white hover:border-marine-950/25",
      )}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl transition-colors",
          selected ? "bg-gold-500 text-marine-950" : "bg-marine-950/6 text-marine-700",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="mt-4 block font-serif text-lg font-bold text-marine-950">{title}</span>
      <span className="mt-1.5 block text-sm/relaxed text-marine-600">{description}</span>
    </button>
  );
}

function TargetCard({ target }: { target: NeedTarget }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-marine-50 p-4">
      <Avatar initials={target.initials} imageUrl={target.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-marine-950">{target.name}</p>
        <p className="truncate text-xs text-marine-500">
          {[target.subtitle, target.city].filter(Boolean).join(" · ")}
        </p>
      </div>
      <Link
        href={`/avocats/${target.slug}`}
        className="shrink-0 text-sm font-semibold text-gold-700 hover:text-gold-800"
      >
        Voir la fiche
      </Link>
    </div>
  );
}

/**
 * Écran servi au visiteur non connecté.
 *
 * Le formulaire n'est pas affiché grisé : laisser quelqu'un rédiger dix lignes
 * avant de lui apprendre qu'il doit d'abord ouvrir un compte est le meilleur
 * moyen de perdre les dix lignes et la personne.
 */
function SignedOutNotice({ target }: { target?: NeedTarget | null }) {
  const suite = target ? `/besoin/nouveau?avocat=${target.slug}` : "/besoin/nouveau";

  return (
    <div className="rounded-2xl border border-dashed border-marine-300 px-6 py-12 text-center">
      <span
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-marine-50 text-marine-400"
        aria-hidden="true"
      >
        <IconScale className="size-6" />
      </span>

      <h2 className="mt-5 font-serif text-xl font-bold text-marine-950">
        Un compte est nécessaire pour déposer votre problème
      </h2>

      <p className="mx-auto mt-3 max-w-md text-[0.95rem]/relaxed text-marine-600">
        Il est gratuit et prend une minute. C’est lui qui vous préviendra quand
        on vous répondra, et qui garde la trace de vos échanges.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href={`/compte/inscription?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ size: "md" })}
        >
          Créer mon compte
        </Link>
        <Link
          href={`/compte/connexion?suite=${encodeURIComponent(suite)}`}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          J’ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
