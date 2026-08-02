"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminCard, Feedback, SaveBar, Toggle } from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { patchJson } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toneGradient } from "@/components/avocats/vitrine/photo-tile";
import type { LawyerProfile, Tone } from "@/lib/data/lawyer-profile";
import { IconEye } from "@/components/ui/icons";

const tones: { id: Tone; label: string }[] = [
  { id: "night", label: "Nuit" },
  { id: "marine", label: "Marine" },
  { id: "trust", label: "Confiance" },
  { id: "gold", label: "Or" },
  { id: "sand", label: "Sable" },
];

/**
 * Identité publique de la vitrine.
 *
 * Distincte de la section « Mon compte » : ce qui se règle ici est ce que le
 * visiteur lit, pas ce que l'équipe de vérification contrôle. Un praticien peut
 * s'afficher « Me Nadège Fokou » tout en étant enregistré sous son état civil.
 */
export function SectionVitrine({
  profile,
  onSaved,
}: {
  profile: LawyerProfile;
  onSaved: (profile: LawyerProfile) => void;
}) {
  const cabinet = profile.type === "cabinet";
  const { run, reset, pending, error, errors, done } = useAdminAction();

  const initial = useMemo(
    () => ({
      displayName: profile.name,
      subtitle: profile.subtitle,
      headline: profile.headline,
      about: profile.about.join("\n\n"),
      responseTime: profile.responseTime,
      coverTone: profile.coverTone,
    }),
    [profile],
  );

  const [draft, setDraft] = useState(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (error || done) reset();
  };

  const save = () =>
    run<Record<string, unknown>>(
      () =>
        patchJson("/api/avocats/vitrine", {
          ...draft,
          // Le backend attend une liste de paragraphes ; l'interface offre une
          // zone de texte unique, séparée par des lignes vides — plus naturel
          // à rédiger qu'un champ répétable.
          about: draft.about
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean),
        }),
      (data) => {
        if (data) onSaved({ ...profile, ...toProfilePatch(data) });
      },
    );

  return (
    <div className="space-y-5">
      <Feedback error={error} done={done} doneLabel="Vitrine enregistrée." />

      <AdminCard
        title="Identité publique"
        description="Ce que les citoyens voient en haut de votre vitrine."
        action={
          <Link
            href={`/avocats/${profile.slug}`}
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              className: "border-marine-950/15",
            })}
          >
            <IconEye className="size-4" />
            Aperçu public
          </Link>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={cabinet ? "Dénomination affichée" : "Nom affiché"}
              htmlFor="displayName"
              error={errors.displayName}
            >
              <TextInput
                id="displayName"
                value={draft.displayName}
                onChange={(event) => set("displayName", event.target.value)}
              />
            </Field>

            <Field
              label="Sous-titre"
              htmlFor="displaySubtitle"
              hint="Affiché entre parenthèses à côté du nom."
            >
              <TextInput
                id="displaySubtitle"
                value={draft.subtitle}
                onChange={(event) => set("subtitle", event.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Accroche"
            htmlFor="headline"
            hint="Une phrase, en tête de l’onglet « À propos »."
          >
            <TextArea
              id="headline"
              value={draft.headline}
              onChange={(event) => set("headline", event.target.value)}
            />
          </Field>

          <Field
            label="Présentation"
            htmlFor="about"
            hint="Séparez vos paragraphes par une ligne vide."
          >
            <TextArea
              id="about"
              className="min-h-40"
              value={draft.about}
              onChange={(event) => set("about", event.target.value)}
            />
          </Field>

          <Field
            label="Délai de réponse annoncé"
            htmlFor="responseTime"
            optional
            hint="Par exemple « 2 h » ou « sous 24 h ». Ne promettez que ce que vous tenez."
          >
            <TextInput
              id="responseTime"
              value={draft.responseTime}
              onChange={(event) => set("responseTime", event.target.value)}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard
        title="Teinte de la couverture"
        description="Utilisée tant qu’aucune photo de couverture n’est téléversée, et derrière elle en dégradé."
      >
        <div className="flex flex-wrap gap-3">
          {tones.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => set("coverTone", tone.id)}
              aria-pressed={draft.coverTone === tone.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition-colors",
                draft.coverTone === tone.id
                  ? "border-gold-500"
                  : "border-transparent hover:border-marine-950/15",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("block h-12 w-20 rounded-xl bg-linear-to-br", toneGradient[tone.id])}
              />
              <span className="text-xs font-semibold text-marine-700">{tone.label}</span>
            </button>
          ))}
        </div>
      </AdminCard>

      <AdminCard
        title="Domaines, langues et coordonnées"
        description="Ces informations alimentent les filtres de l’annuaire : elles se règlent dans « Mon compte »."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-marine-50 p-4">
            <p className="text-xs text-marine-500">Domaines de compétence</p>
            <p className="mt-1 text-sm font-semibold text-marine-950">
              {profile.specialties.join(" · ") || "Aucun domaine sélectionné"}
            </p>
          </div>
          <div className="rounded-2xl bg-marine-50 p-4">
            <p className="text-xs text-marine-500">Langues de travail</p>
            <p className="mt-1 text-sm font-semibold text-marine-950">
              {profile.languages.join(" · ") || "Aucune langue sélectionnée"}
            </p>
          </div>
          <div className="rounded-2xl bg-marine-50 p-4 sm:col-span-2">
            <p className="text-xs text-marine-500">Adresse affichée</p>
            <p className="mt-1 text-sm font-semibold text-marine-950">
              {[profile.address, profile.district, profile.city].filter(Boolean).join(", ") ||
                "Adresse non renseignée"}
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Visibilité"
        description="La publication de la vitrine suit la vérification de votre compte : elle n’est pas réglable ici."
      >
        <div className="divide-y divide-marine-950/6">
          <Toggle
            label="Vitrine publique"
            description={
              profile.isPublished
                ? "Votre fiche est en ligne dans l’annuaire."
                : "Votre fiche sera mise en ligne dès la validation de vos justificatifs."
            }
            on={profile.isPublished ?? false}
            disabled
          />
          <Toggle
            label="Afficher les honoraires indicatifs"
            description="Recommandé : les fiches avec tarifs reçoivent 3 fois plus de demandes."
            defaultOn
          />
          <Toggle label="Afficher la galerie photo" defaultOn />
          <Toggle label="Accepter les rendez-vous en visioconférence" defaultOn />
        </div>
      </AdminCard>

      <SaveBar
        dirty={dirty}
        pending={pending}
        done={done}
        onSave={save}
        onReset={() => {
          setDraft(initial);
          reset();
        }}
      />
    </div>
  );
}

/**
 * Extrait du profil renvoyé par l'API les champs que cette section modifie.
 *
 * La réponse porte la vitrine entière ; n'en reprendre que ces champs évite
 * d'écraser les listes (albums, guides, prestations) qu'une autre section a pu
 * faire évoluer entre-temps.
 */
function toProfilePatch(data: Record<string, unknown>): Partial<LawyerProfile> {
  const patch: Partial<LawyerProfile> = {};

  if (typeof data.name === "string") patch.name = data.name;
  if (typeof data.subtitle === "string") patch.subtitle = data.subtitle;
  if (typeof data.initials === "string") patch.initials = data.initials;
  if (typeof data.headline === "string") patch.headline = data.headline;
  if (typeof data.responseTime === "string") patch.responseTime = data.responseTime;
  if (Array.isArray(data.about)) patch.about = data.about.filter((p): p is string => typeof p === "string");
  if (typeof data.coverTone === "string") {
    patch.coverTone = data.coverTone as Tone;
  }

  return patch;
}
