"use client";

import { useMemo, useState } from "react";
import { AdminCard, Feedback, SaveBar } from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import {
  ChipToggle,
  Field,
  SelectInput,
  TextInput,
} from "@/components/ui/form";
import { patchJson } from "@/lib/api/client";
import { bars, legalForms, managerRoles, practiceLanguages } from "@/lib/avocats/signup";
import { cities, specialties } from "@/lib/data/home";
import type { AccountDraft, ApiAccount } from "@/lib/api/types";
import { IconAlert, IconBriefcase, IconMail, IconUser } from "@/components/ui/icons";

/**
 * Part reversée à l'auteur sur chaque vente de guide.
 *
 * Écrite ici pour l'affichage seul : le calcul fait autorité côté plugin
 * (TAL_Payouts::SHARE), et rien de ce que le navigateur croit ne l'influence.
 */
const SHARE_LABEL = "70 %";

/**
 * Modification du compte — le pendant privé de l'inscription.
 *
 * Les champs diffèrent selon le type de compte : un cabinet a une dénomination,
 * un RCCM et un représentant légal ; un avocat indépendant a un nom, une date de
 * prestation de serment et un numéro de carte professionnelle. Le type, lui, ne
 * se change pas ici : basculer un cabinet en compte individuel invaliderait ses
 * justificatifs déjà vérifiés.
 */
export function SectionCompte({
  account,
  onSaved,
}: {
  account: ApiAccount;
  onSaved: (account: ApiAccount) => void;
}) {
  const cabinet = account.accountType === "cabinet";
  const { run, reset, pending, error, errors, done } = useAdminAction();

  const initial = useMemo(() => toDraft(account), [account]);
  const [draft, setDraft] = useState<AccountDraft>(initial);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const set = <K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (error || done) reset();
  };

  /** Ajoute ou retire une valeur d'une liste à sélection multiple. */
  const toggle = (key: "specialties" | "languages", value: string) => {
    const current = draft[key] ?? [];

    set(
      key,
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const save = () =>
    run<{ account: ApiAccount }>(
      () => patchJson("/api/avocats/compte", draft),
      (data) => {
        if (data?.account) onSaved(data.account);
      },
    );

  const maxSpecialties = cabinet ? 8 : 5;
  const chosen = draft.specialties ?? [];

  return (
    <div className="space-y-5">
      <Feedback error={error} done={done} doneLabel="Informations du compte enregistrées." />

      {/* ---------------- Identité ---------------- */}
      <AdminCard
        title={cabinet ? "Identité du cabinet" : "Identité"}
        description={
          cabinet
            ? "Ces informations figurent sur votre dossier de vérification, pas nécessairement sur votre vitrine."
            : "Votre état civil, tel qu’il apparaît sur votre carte professionnelle."
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {cabinet ? (
            <>
              <Field
                label="Dénomination du cabinet"
                htmlFor="firmName"
                error={errors.firmName}
                className="sm:col-span-2"
              >
                <TextInput
                  id="firmName"
                  value={draft.firmName ?? ""}
                  invalid={Boolean(errors.firmName)}
                  onChange={(event) => set("firmName", event.target.value)}
                />
              </Field>

              <Field label="Forme juridique" htmlFor="legalForm" error={errors.legalForm}>
                <SelectInput
                  id="legalForm"
                  value={draft.legalForm ?? ""}
                  invalid={Boolean(errors.legalForm)}
                  onChange={(event) => set("legalForm", event.target.value)}
                >
                  <option value="">Sélectionnez…</option>
                  {legalForms.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label="Numéro RCCM"
                htmlFor="rccm"
                hint="Format : RC/DLA/2019/B/1234."
                error={errors.rccm}
              >
                <TextInput
                  id="rccm"
                  value={draft.rccm ?? ""}
                  invalid={Boolean(errors.rccm)}
                  onChange={(event) => set("rccm", event.target.value.toUpperCase())}
                />
              </Field>

              <Field label="Date de création" htmlFor="foundedOn" error={errors.foundedOn}>
                <TextInput
                  id="foundedOn"
                  type="date"
                  value={draft.foundedOn ?? ""}
                  invalid={Boolean(errors.foundedOn)}
                  onChange={(event) => set("foundedOn", event.target.value)}
                />
              </Field>

              <Field label="Nombre d’avocats" htmlFor="headcount" error={errors.headcount}>
                <TextInput
                  id="headcount"
                  type="number"
                  min={1}
                  max={500}
                  value={draft.headcount ?? ""}
                  invalid={Boolean(errors.headcount)}
                  onChange={(event) => set("headcount", Number(event.target.value))}
                />
              </Field>

              <Field
                label="Représentant légal"
                htmlFor="managerName"
                error={errors.managerName}
              >
                <TextInput
                  id="managerName"
                  value={draft.managerName ?? ""}
                  invalid={Boolean(errors.managerName)}
                  onChange={(event) => set("managerName", event.target.value)}
                />
              </Field>

              <Field label="Sa qualité" htmlFor="managerRole" error={errors.managerRole}>
                <SelectInput
                  id="managerRole"
                  value={draft.managerRole ?? ""}
                  invalid={Boolean(errors.managerRole)}
                  onChange={(event) => set("managerRole", event.target.value)}
                >
                  <option value="">Sélectionnez…</option>
                  {managerRoles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </SelectInput>
              </Field>
            </>
          ) : (
            <>
              <Field label="Nom" htmlFor="lastName" error={errors.lastName}>
                <TextInput
                  id="lastName"
                  value={draft.lastName ?? ""}
                  invalid={Boolean(errors.lastName)}
                  onChange={(event) => set("lastName", event.target.value)}
                />
              </Field>

              <Field label="Prénom" htmlFor="firstName" error={errors.firstName}>
                <TextInput
                  id="firstName"
                  value={draft.firstName ?? ""}
                  invalid={Boolean(errors.firstName)}
                  onChange={(event) => set("firstName", event.target.value)}
                />
              </Field>

              <Field label="Date de naissance" htmlFor="birthDate" error={errors.birthDate}>
                <TextInput
                  id="birthDate"
                  type="date"
                  value={draft.birthDate ?? ""}
                  invalid={Boolean(errors.birthDate)}
                  onChange={(event) => set("birthDate", event.target.value)}
                />
              </Field>

              <Field
                label="Carte professionnelle"
                htmlFor="licenceNumber"
                error={errors.licenceNumber}
              >
                <TextInput
                  id="licenceNumber"
                  value={draft.licenceNumber ?? ""}
                  invalid={Boolean(errors.licenceNumber)}
                  onChange={(event) => set("licenceNumber", event.target.value)}
                />
              </Field>
            </>
          )}
        </div>
      </AdminCard>

      {/* ---------------- Exercice ---------------- */}
      <AdminCard
        title="Exercice professionnel"
        description="Le barreau et les domaines alimentent les filtres de l’annuaire : ce sont eux qui vous rendent trouvable."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Barreau" htmlFor="bar" error={errors.bar}>
              <SelectInput
                id="bar"
                value={draft.bar ?? ""}
                invalid={Boolean(errors.bar)}
                onChange={(event) => set("bar", event.target.value)}
              >
                <option value="">Sélectionnez…</option>
                {bars.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectInput>
            </Field>

            {!cabinet && (
              <>
                <Field
                  label="Prestation de serment"
                  htmlFor="oathDate"
                  error={errors.oathDate}
                >
                  <TextInput
                    id="oathDate"
                    type="date"
                    value={draft.oathDate ?? ""}
                    invalid={Boolean(errors.oathDate)}
                    onChange={(event) => set("oathDate", event.target.value)}
                  />
                </Field>

                <Field
                  label="Années d’exercice"
                  htmlFor="experienceYears"
                  error={errors.experienceYears}
                >
                  <TextInput
                    id="experienceYears"
                    type="number"
                    min={0}
                    max={70}
                    value={draft.experienceYears ?? ""}
                    invalid={Boolean(errors.experienceYears)}
                    onChange={(event) => set("experienceYears", Number(event.target.value))}
                  />
                </Field>
              </>
            )}
          </div>

          <Field
            label="Domaines de compétence"
            hint={`${chosen.length} / ${maxSpecialties} sélectionnés.`}
            error={errors.specialties}
          >
            <div className="flex flex-wrap gap-2">
              {specialties.map((item) => {
                const active = chosen.includes(item);

                return (
                  <ChipToggle
                    key={item}
                    active={active}
                    // Bloquer au-delà du plafond plutôt que laisser le serveur
                    // refuser : le praticien comprend la règle en la rencontrant.
                    onToggle={() => {
                      if (!active && chosen.length >= maxSpecialties) return;
                      toggle("specialties", item);
                    }}
                  >
                    {item}
                  </ChipToggle>
                );
              })}
            </div>
          </Field>

          <Field label="Langues de travail" error={errors.languages}>
            <div className="flex flex-wrap gap-2">
              {practiceLanguages.map((item) => (
                <ChipToggle
                  key={item}
                  active={(draft.languages ?? []).includes(item)}
                  onToggle={() => toggle("languages", item)}
                >
                  {item}
                </ChipToggle>
              ))}
            </div>
          </Field>
        </div>
      </AdminCard>

      {/* ---------------- Coordonnées ---------------- */}
      <AdminCard
        title="Coordonnées"
        description="L’adresse s’affiche sur votre vitrine. Votre téléphone reste réservé à l’équipe TakeALawyer."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ville" htmlFor="city" error={errors.city}>
            <SelectInput
              id="city"
              value={draft.city ?? ""}
              invalid={Boolean(errors.city)}
              onChange={(event) => set("city", event.target.value)}
            >
              <option value="">Sélectionnez…</option>
              {cities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Quartier" htmlFor="district" error={errors.district}>
            <TextInput
              id="district"
              value={draft.district ?? ""}
              invalid={Boolean(errors.district)}
              onChange={(event) => set("district", event.target.value)}
            />
          </Field>

          <Field
            label={cabinet ? "Adresse du cabinet" : "Adresse professionnelle"}
            htmlFor="address"
            error={errors.address}
            className="sm:col-span-2"
          >
            <TextInput
              id="address"
              value={draft.address ?? ""}
              invalid={Boolean(errors.address)}
              onChange={(event) => set("address", event.target.value)}
            />
          </Field>

          <Field label="Boîte postale" htmlFor="poBox" optional error={errors.poBox}>
            <TextInput
              id="poBox"
              value={draft.poBox ?? ""}
              onChange={(event) => set("poBox", event.target.value)}
            />
          </Field>

          <Field label="Site web" htmlFor="website" optional error={errors.website}>
            <TextInput
              id="website"
              value={draft.website ?? ""}
              invalid={Boolean(errors.website)}
              placeholder="cabinet-fokou.cm"
              onChange={(event) => set("website", event.target.value)}
            />
          </Field>
        </div>
      </AdminCard>

      {/* ---------------- Connexion ---------------- */}
      <AdminCard
        title="Identifiants de connexion"
        description="L’adresse e-mail sert à vous connecter et à recevoir les demandes des citoyens."
      >
        <p className="mb-5 flex items-start gap-2.5 rounded-2xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <IconAlert className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          Changer d’adresse e-mail change votre identifiant de connexion dès
          l’enregistrement. Vérifiez la saisie avant de valider.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Adresse e-mail" htmlFor="email" error={errors.email}>
            <TextInput
              id="email"
              type="email"
              value={draft.email ?? ""}
              invalid={Boolean(errors.email)}
              onChange={(event) => set("email", event.target.value)}
            />
          </Field>

          <Field
            label="Téléphone"
            htmlFor="phone"
            hint="6XX XX XX XX ou +237 6XX XX XX XX."
            error={errors.phone}
          >
            <TextInput
              id="phone"
              type="tel"
              value={draft.phone ?? ""}
              invalid={Boolean(errors.phone)}
              onChange={(event) => set("phone", event.target.value)}
            />
          </Field>

          {/*
            Numéro de reversement — distinct du téléphone de contact juste
            au-dessus, et la nuance mérite d'être dite : celui-ci reçoit de
            l'argent. Sans lui, le backend refuse la publication d'un guide,
            d'où l'avertissement plutôt qu'un simple champ facultatif.
          */}
          <Field
            label="Numéro Mobile Money"
            htmlFor="momoPhone"
            hint="MTN ou Orange. C’est sur ce numéro que vos ventes vous sont reversées — exigé pour publier un guide payant."
            error={errors.momoPhone}
          >
            <TextInput
              id="momoPhone"
              type="tel"
              inputMode="tel"
              placeholder="6 99 00 00 00"
              value={draft.momoPhone ?? ""}
              invalid={Boolean(errors.momoPhone)}
              onChange={(event) => set("momoPhone", event.target.value)}
            />
          </Field>
        </div>

        {!account.momoPhone && (
          <p
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset"
          >
            <IconAlert className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
            <span>
              <span className="font-semibold">Numéro Mobile Money manquant.</span>{" "}
              Renseignez-le pour pouvoir publier un guide payant : c’est le compte
              sur lequel {SHARE_LABEL} du montant net de chaque vente vous sera
              versé. Vos guides gratuits ne sont pas concernés.
            </span>
          </p>
        )}

        <dl className="mt-6 grid gap-4 border-t border-marine-950/6 pt-5 sm:grid-cols-3">
          {[
            { label: "Type de compte", value: cabinet ? "Cabinet" : "Avocat indépendant", Icon: cabinet ? IconBriefcase : IconUser },
            { label: "Identifiant", value: account.id.slice(0, 8), Icon: IconMail },
            { label: "Inscrit le", value: formatDate(account.createdAt), Icon: IconUser },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-marine-400" />
              <div className="min-w-0">
                <dt className="text-xs text-marine-500">{label}</dt>
                <dd className="truncate text-sm font-semibold text-marine-950">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
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

/* -------------------------------------------------------------------------- */

/**
 * Extrait du compte les seuls champs modifiables ici.
 *
 * Les valeurs nulles deviennent des chaînes vides : un `<input>` dont la valeur
 * passe de `null` à une chaîne bascule de non contrôlé à contrôlé, ce que React
 * signale à juste titre comme un bug.
 */
function toDraft(account: ApiAccount): AccountDraft {
  const common: AccountDraft = {
    email: account.email ?? "",
    phone: account.phone ?? "",
    momoPhone: account.momoPhone ?? "",
    bar: account.bar ?? "",
    city: account.city ?? "",
    district: account.district ?? "",
    address: account.address ?? "",
    poBox: account.poBox ?? "",
    website: account.website ?? "",
    specialties: account.specialties ?? [],
    languages: account.languages ?? [],
  };

  if (account.accountType === "cabinet") {
    return {
      ...common,
      firmName: account.firmName ?? "",
      legalForm: account.legalForm ?? "",
      rccm: account.rccm ?? "",
      foundedOn: account.foundedOn ?? "",
      managerName: account.managerName ?? "",
      managerRole: account.managerRole ?? "",
      headcount: account.headcount ?? 1,
    };
  }

  return {
    ...common,
    lastName: account.lastName ?? "",
    firstName: account.firstName ?? "",
    birthDate: account.birthDate ?? "",
    licenceNumber: account.licenceNumber ?? "",
    oathDate: account.oathDate ?? "",
    experienceYears: account.experienceYears ?? 0,
  };
}

/** Date MySQL du plugin en libellé court. */
function formatDate(value: string): string {
  const timestamp = Date.parse(value.replace(" ", "T"));

  if (Number.isNaN(timestamp)) return "—";

  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
