"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import {
  CheckboxField,
  ChipToggle,
  Field,
  RadioCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { cities, specialties } from "@/lib/data/home";
import {
  bars,
  emptySignupForm,
  firstStepWithError,
  legalForms,
  managerRoles,
  plans,
  practiceLanguages,
  requiredDocuments,
  signupSteps,
  validateStep,
  type Errors,
  type SignupForm,
} from "@/lib/avocats/signup";
import { postForm, postJson } from "@/lib/api/client";
import type { ApiAccount, RegisterResult } from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconBadgeCheck,
  IconBuilding,
  IconCheck,
  IconChevronLeft,
  IconCrown,
  IconLock,
  IconScale,
  IconShieldCheck,
  IconSparkles,
  IconUpload,
  IconUser,
} from "@/components/ui/icons";

type Setter = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => void;

type StepProps = {
  form: SignupForm;
  set: Setter;
  /**
   * Les deux mises à jour ci-dessous dérivent la nouvelle valeur de l'ancienne.
   * Elles passent par la forme fonctionnelle de `setForm` : calculer à partir
   * du `form` capturé dans la closure ferait perdre une sélection dès que deux
   * changements tombent dans le même cycle de rendu.
   */
  toggleList: (key: "specialties" | "languages", value: string) => void;
  /** `null` retire la pièce déjà choisie. */
  attachDocument: (id: string, file: File | null) => void;
  errors: Errors;
};

/**
 * Parcours de création d'un compte avocat, en six étapes.
 *
 * Les erreurs n'apparaissent qu'après une première tentative de passage à
 * l'étape suivante : on ne réprimande pas quelqu'un pour un champ qu'il n'a pas
 * encore fini de remplir. Une fois affichées, elles se recalculent à chaque
 * frappe et disparaissent dès que la saisie devient valide.
 */
/** Résultat de l'inscription, une fois le compte créé et les pièces déposées. */
type Outcome = {
  account: ApiAccount;
  /** Identifiants des pièces dont le dépôt a échoué. */
  failedUploads: string[];
};

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SignupForm>(emptySignupForm);
  const [validated, setValidated] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  /* État de l'envoi */
  const [submitting, setSubmitting] = useState(false);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [serverMessage, setServerMessage] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  // Les erreurs du serveur se superposent aux règles locales. Chaque étape ne
  // lit que ses propres clés : celles des autres étapes restent inertes.
  const errors: Errors = {
    ...serverErrors,
    ...(validated ? validateStep(step, form) : {}),
  };

  const set: Setter = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));

    // Corriger un champ signalé par le serveur doit effacer son message :
    // sinon l'erreur persiste alors que la saisie est devenue correcte.
    setServerErrors((current) => {
      if (!(key in current)) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const toggleList: StepProps["toggleList"] = (key, value) =>
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });

  const attachDocument: StepProps["attachDocument"] = (id, file) =>
    setForm((current) => {
      const documents = { ...current.documents };

      if (file) {
        documents[id] = file;
      } else {
        delete documents[id];
      }

      return { ...current, documents };
    });

  const scrollToTop = () =>
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /**
   * Crée le compte, puis dépose les pièces éventuellement fournies.
   *
   * Les pièces partent après la création, et une par une : chacune exige la
   * session ouverte par l'inscription, et un envoi séquentiel permet d'afficher
   * une progression honnête plutôt qu'un chargement indéterminé.
   */
  const submit = async () => {
    setSubmitting(true);
    setServerMessage("");
    setServerErrors({});

    const { documents, ...payload } = form;

    const created = await postJson<RegisterResult>("/api/avocats/inscription", payload);

    if (!created.ok || !created.data) {
      setSubmitting(false);
      setServerMessage(created.message);
      setServerErrors(created.errors);

      // Ramener le visiteur là où se trouve le champ fautif : le serveur
      // revalide tout le formulaire, l'erreur concerne souvent une étape
      // antérieure à celle affichée.
      const target = firstStepWithError(created.errors);

      if (target >= 0) {
        setStep(target);
        setValidated(true);
      }

      scrollToTop();
      return;
    }

    const pieces = Object.entries(documents);
    const failedUploads: string[] = [];

    setUpload({ done: 0, total: pieces.length });

    for (const [type, file] of pieces) {
      const body = new FormData();
      body.set("type", type);
      body.set("file", file);

      const sent = await postForm("/api/avocats/justificatifs", body);

      if (!sent.ok) failedUploads.push(type);

      setUpload((current) => (current ? { ...current, done: current.done + 1 } : current));
    }

    setUpload(null);
    setSubmitting(false);
    setOutcome({ account: created.data.account, failedUploads });
    scrollToTop();
  };

  const goNext = () => {
    const found = validateStep(step, form);
    if (Object.keys(found).length > 0) {
      setValidated(true);
      scrollToTop();
      return;
    }

    setValidated(false);

    if (step === signupSteps.length - 1) {
      void submit();
    } else {
      setStep((s) => s + 1);
      scrollToTop();
    }
  };

  const goBack = () => {
    setValidated(false);
    setStep((s) => Math.max(0, s - 1));
    scrollToTop();
  };

  if (outcome) {
    return (
      <SubmissionDone
        form={form}
        account={outcome.account}
        failedUploads={outcome.failedUploads}
      />
    );
  }

  const stepProps: StepProps = { form, set, toggleList, attachDocument, errors };
  const last = step === signupSteps.length - 1;

  return (
    <div ref={top} className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-14">
      <Stepper current={step} form={form} />

      <div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            goNext();
          }}
          noValidate
        >
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8 lg:p-10">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase">
              Étape {step + 1} sur {signupSteps.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl/snug font-bold text-marine-950 sm:text-3xl/snug">
              {signupSteps[step].title}
            </h2>
            <p className="mt-2 text-marine-600">{signupSteps[step].hint}</p>

            {/* Message du serveur : refus d'inscription, adresse déjà prise,
                backend injoignable. Prioritaire sur le décompte local, car il
                explique précisément ce qui s'est passé. */}
            {serverMessage && (
              <p
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
              >
                <IconAlert className="mt-0.5 size-4.5 shrink-0" />
                {serverMessage}
              </p>
            )}

            {!serverMessage && validated && Object.keys(errors).length > 0 && (
              <p
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
              >
                <IconAlert className="mt-0.5 size-4.5 shrink-0" />
                {Object.keys(errors).length === 1
                  ? "Un champ demande votre attention avant de continuer."
                  : `${Object.keys(errors).length} champs demandent votre attention avant de continuer.`}
              </p>
            )}

            <div className="mt-8">
              {step === 0 && <StepAccountType {...stepProps} />}
              {step === 1 && <StepIdentity {...stepProps} />}
              {step === 2 && <StepPractice {...stepProps} />}
              {step === 3 && <StepContact {...stepProps} />}
              {step === 4 && <StepDocuments {...stepProps} />}
              {step === 5 && <StepPlan {...stepProps} />}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className={buttonStyles({
                  variant: "outline",
                  size: "md",
                  className: "border-marine-950/15",
                })}
              >
                <IconChevronLeft className="size-4" />
                Retour
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting || undefined}
              className={buttonStyles({ size: "md" })}
            >
              {/* Le libellé décrit l'étape en cours plutôt qu'un « Envoi… »
                  générique : le dépôt des pièces peut durer, autant dire
                  laquelle passe. */}
              {upload
                ? `Envoi des pièces… ${upload.done}/${upload.total}`
                : submitting
                  ? "Création du compte…"
                  : last
                    ? "Envoyer ma demande"
                    : "Continuer"}
              {!submitting && (
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs/relaxed text-marine-500">
            <IconLock className="mt-px size-3.5 shrink-0 text-trust-600" />
            Vos pièces justificatives ne sont lues que par l’équipe de
            vérification. Elles ne sont jamais affichées sur votre vitrine.
          </p>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fil des étapes                                                             */
/* -------------------------------------------------------------------------- */

function Stepper({ current, form }: { current: number; form: SignupForm }) {
  // `min-w-0` : le fil d'étapes défile horizontalement sur mobile ; sans cela,
  // sa largeur deviendrait la largeur minimale de la colonne de grille, et
  // c'est toute la page qui déborderait à l'horizontale.
  return (
    <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <ol className="scrollbar-none flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
        {signupSteps.map((item, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li key={item.id} className="shrink-0 lg:shrink">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors lg:px-4 lg:py-3",
                  active && "bg-white shadow-card ring-1 ring-marine-950/6",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                    done && "bg-trust-500 text-white",
                    active && "bg-gold-500 text-marine-950",
                    !done && !active && "bg-marine-950/8 text-marine-500",
                  )}
                >
                  {done ? <IconCheck className="size-4" strokeWidth={3} /> : index + 1}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-semibold whitespace-nowrap lg:whitespace-normal",
                      active ? "text-marine-950" : "text-marine-600",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="hidden text-xs text-marine-500 lg:block">
                    {item.hint}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {form.accountType && (
        <p className="mt-6 hidden items-center gap-2 rounded-2xl bg-marine-950 px-4 py-3 text-sm font-semibold text-white lg:flex">
          {form.accountType === "cabinet" ? (
            <IconBuilding className="size-4.5 text-gold-400" />
          ) : (
            <IconUser className="size-4.5 text-gold-400" />
          )}
          {form.accountType === "cabinet"
            ? "Compte cabinet"
            : "Compte avocat indépendant"}
        </p>
      )}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 1 — type de compte                                                   */
/* -------------------------------------------------------------------------- */

function StepAccountType({ form, set, errors }: StepProps) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <RadioCard
          selected={form.accountType === "individuel"}
          onSelect={() => set("accountType", "individuel")}
          icon={<IconScale className="size-6" />}
          title="Avocat indépendant"
          description="Vous exercez en votre nom propre. Votre vitrine porte votre nom et votre carte professionnelle."
        >
          <ul className="mt-5 space-y-2 border-t border-marine-950/8 pt-4">
            {[
              "Carte professionnelle et serment vérifiés",
              "Vitrine personnelle avec galerie",
              "Vous répondez seul aux besoins",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[0.8rem]/snug text-marine-700"
              >
                <IconCheck className="mt-px size-3.5 shrink-0 text-trust-600" />
                {item}
              </li>
            ))}
          </ul>
        </RadioCard>

        <RadioCard
          selected={form.accountType === "cabinet"}
          onSelect={() => set("accountType", "cabinet")}
          icon={<IconBuilding className="size-6" />}
          title="Cabinet / Bureau d’avocats"
          description="Vous inscrivez une structure. La vitrine porte la dénomination du cabinet et présente vos collaborateurs."
        >
          <ul className="mt-5 space-y-2 border-t border-marine-950/8 pt-4">
            {[
              "RCCM et représentant légal vérifiés",
              "Vitrine collective, équipe présentée",
              "Plusieurs avocats répondent aux besoins",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[0.8rem]/snug text-marine-700"
              >
                <IconCheck className="mt-px size-3.5 shrink-0 text-trust-600" />
                {item}
              </li>
            ))}
          </ul>
        </RadioCard>
      </div>

      {errors.accountType && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-danger-600"
        >
          <IconAlert className="size-4 shrink-0" />
          {errors.accountType}
        </p>
      )}

      <p className="mt-6 text-sm/relaxed text-marine-500">
        Ce choix détermine les pièces qui vous seront demandées. Il reste
        modifiable tant que votre dossier n’a pas été validé.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 2 — identité                                                         */
/* -------------------------------------------------------------------------- */

function StepIdentity({ form, set, errors }: StepProps) {
  const cabinet = form.accountType === "cabinet";

  return (
    <div className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="mb-4 text-sm font-bold tracking-wide text-marine-950 uppercase">
          {cabinet ? "Le cabinet" : "L’avocat"}
        </legend>

        {cabinet ? (
          <>
            <Field
              label="Dénomination du cabinet"
              htmlFor="firmName"
              required
              error={errors.firmName}
            >
              <TextInput
                id="firmName"
                value={form.firmName}
                invalid={!!errors.firmName}
                placeholder="Cabinet Fokou &amp; Partners"
                onChange={(e) => set("firmName", e.target.value)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Forme juridique"
                htmlFor="legalForm"
                required
                error={errors.legalForm}
              >
                <SelectInput
                  id="legalForm"
                  value={form.legalForm}
                  invalid={!!errors.legalForm}
                  onChange={(e) => set("legalForm", e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {legalForms.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label="Numéro RCCM"
                htmlFor="rccm"
                required
                hint="Registre du commerce et du crédit mobilier."
                error={errors.rccm}
              >
                <TextInput
                  id="rccm"
                  value={form.rccm}
                  invalid={!!errors.rccm}
                  placeholder="RC/DLA/2019/B/1234"
                  onChange={(e) => set("rccm", e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Date de création"
              htmlFor="foundedOn"
              required
              error={errors.foundedOn}
              className="sm:max-w-xs"
            >
              <TextInput
                id="foundedOn"
                type="date"
                value={form.foundedOn}
                invalid={!!errors.foundedOn}
                onChange={(e) => set("foundedOn", e.target.value)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Représentant légal"
                htmlFor="managerName"
                required
                error={errors.managerName}
              >
                <TextInput
                  id="managerName"
                  value={form.managerName}
                  invalid={!!errors.managerName}
                  placeholder="Me Nadège Fokou"
                  onChange={(e) => set("managerName", e.target.value)}
                />
              </Field>

              <Field
                label="Qualité"
                htmlFor="managerRole"
                required
                error={errors.managerRole}
              >
                <SelectInput
                  id="managerRole"
                  value={form.managerRole}
                  invalid={!!errors.managerRole}
                  onChange={(e) => set("managerRole", e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {managerRoles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom" htmlFor="lastName" required error={errors.lastName}>
                <TextInput
                  id="lastName"
                  value={form.lastName}
                  invalid={!!errors.lastName}
                  placeholder="Fokou"
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </Field>

              <Field
                label="Prénom"
                htmlFor="firstName"
                required
                error={errors.firstName}
              >
                <TextInput
                  id="firstName"
                  value={form.firstName}
                  invalid={!!errors.firstName}
                  placeholder="Nadège"
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </Field>
            </div>

            <Field
              label="Date de naissance"
              htmlFor="birthDate"
              required
              error={errors.birthDate}
              className="sm:max-w-xs"
            >
              <TextInput
                id="birthDate"
                type="date"
                value={form.birthDate}
                invalid={!!errors.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
              />
            </Field>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-5 border-t border-marine-950/8 pt-8">
        <legend className="mb-4 text-sm font-bold tracking-wide text-marine-950 uppercase">
          Identifiants de connexion
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Adresse e-mail professionnelle"
            htmlFor="email"
            required
            error={errors.email}
          >
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              invalid={!!errors.email}
              placeholder="contact@cabinet.cm"
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <Field
            label="Téléphone"
            htmlFor="phone"
            required
            hint="Format camerounais, indicatif facultatif."
            error={errors.phone}
          >
            <TextInput
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              invalid={!!errors.phone}
              placeholder="6 99 00 00 00"
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Mot de passe"
            htmlFor="password"
            required
            hint="8 caractères minimum, lettres et chiffres."
            error={errors.password}
          >
            <TextInput
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              invalid={!!errors.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>

          <Field
            label="Confirmation"
            htmlFor="passwordConfirm"
            required
            error={errors.passwordConfirm}
          >
            <TextInput
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              value={form.passwordConfirm}
              invalid={!!errors.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
            />
          </Field>
        </div>
      </fieldset>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 3 — exercice professionnel                                           */
/* -------------------------------------------------------------------------- */

function StepPractice({ form, set, toggleList, errors }: StepProps) {
  const cabinet = form.accountType === "cabinet";
  const maxSpecialties = cabinet ? 8 : 5;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={cabinet ? "Barreau de rattachement" : "Barreau"}
          htmlFor="bar"
          required
          error={errors.bar}
        >
          <SelectInput
            id="bar"
            value={form.bar}
            invalid={!!errors.bar}
            onChange={(e) => set("bar", e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {bars.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectInput>
        </Field>

        {cabinet ? (
          <Field
            label="Nombre d’avocats"
            htmlFor="headcount"
            required
            hint="Collaborateurs inscrits au Barreau, vous compris."
            error={errors.headcount}
          >
            <TextInput
              id="headcount"
              type="number"
              min={1}
              value={form.headcount}
              invalid={!!errors.headcount}
              placeholder="6"
              onChange={(e) => set("headcount", e.target.value)}
            />
          </Field>
        ) : (
          <Field
            label="Numéro de carte professionnelle"
            htmlFor="licenceNumber"
            required
            error={errors.licenceNumber}
          >
            <TextInput
              id="licenceNumber"
              value={form.licenceNumber}
              invalid={!!errors.licenceNumber}
              placeholder="CM-2011-04872"
              onChange={(e) => set("licenceNumber", e.target.value)}
            />
          </Field>
        )}
      </div>

      {!cabinet && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Date de prestation de serment"
            htmlFor="oathDate"
            required
            error={errors.oathDate}
          >
            <TextInput
              id="oathDate"
              type="date"
              value={form.oathDate}
              invalid={!!errors.oathDate}
              onChange={(e) => set("oathDate", e.target.value)}
            />
          </Field>

          <Field
            label="Années d’exercice"
            htmlFor="experienceYears"
            required
            error={errors.experienceYears}
          >
            <TextInput
              id="experienceYears"
              type="number"
              min={0}
              value={form.experienceYears}
              invalid={!!errors.experienceYears}
              placeholder="14"
              onChange={(e) => set("experienceYears", e.target.value)}
            />
          </Field>
        </div>
      )}

      <Field
        label="Domaines de compétence"
        required
        hint={`${form.specialties.length} sélectionné${form.specialties.length > 1 ? "s" : ""} sur ${maxSpecialties} maximum.`}
        error={errors.specialties}
      >
        <div className="flex flex-wrap gap-2">
          {specialties.map((item) => (
            <ChipToggle
              key={item}
              active={form.specialties.includes(item)}
              onToggle={() => toggleList("specialties", item)}
            >
              {item}
            </ChipToggle>
          ))}
        </div>
      </Field>

      <Field
        label="Langues de travail"
        required
        error={errors.languages}
      >
        <div className="flex flex-wrap gap-2">
          {practiceLanguages.map((item) => (
            <ChipToggle
              key={item}
              active={form.languages.includes(item)}
              onToggle={() => toggleList("languages", item)}
            >
              {item}
            </ChipToggle>
          ))}
        </div>
      </Field>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 4 — coordonnées                                                      */
/* -------------------------------------------------------------------------- */

function StepContact({ form, set, errors }: StepProps) {
  const cabinet = form.accountType === "cabinet";

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ville" htmlFor="city" required error={errors.city}>
          <SelectInput
            id="city"
            value={form.city}
            invalid={!!errors.city}
            onChange={(e) => set("city", e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Quartier" htmlFor="district" required error={errors.district}>
          <TextInput
            id="district"
            value={form.district}
            invalid={!!errors.district}
            placeholder="Bonanjo"
            onChange={(e) => set("district", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label={cabinet ? "Adresse du cabinet" : "Adresse professionnelle"}
        htmlFor="address"
        required
        hint="Elle apparaît sur votre vitrine publique."
        error={errors.address}
      >
        <TextArea
          id="address"
          value={form.address}
          invalid={!!errors.address}
          placeholder="Immeuble Vieira, 3e étage, rue Joss"
          onChange={(e) => set("address", e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Boîte postale" htmlFor="poBox" optional>
          <TextInput
            id="poBox"
            value={form.poBox}
            placeholder="BP 4521 Douala"
            onChange={(e) => set("poBox", e.target.value)}
          />
        </Field>

        <Field label="Site web" htmlFor="website" optional error={errors.website}>
          <TextInput
            id="website"
            value={form.website}
            invalid={!!errors.website}
            placeholder="cabinet-fokou.cm"
            onChange={(e) => set("website", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 5 — justificatifs                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Étape 5 — justificatifs.
 *
 * Aucune pièce n'est exigée pour créer le compte : celui qui n'a pas ses scans
 * sous la main termine son inscription et revient les déposer depuis son
 * espace. Les pièces restent nécessaires à la vérification — donc à la mise en
 * ligne de la vitrine — mais ce n'est plus cette étape qui l'impose.
 */
function StepDocuments({ form, attachDocument }: StepProps) {
  const documents = requiredDocuments(form.accountType);
  const provided = Object.keys(form.documents).length;

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
        <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
        Déposez ce que vous avez sous la main — rien n’est obligatoire à ce
        stade. Vous pourrez compléter votre dossier à tout moment depuis votre
        espace. La vitrine est mise en ligne une fois les pièces contrôlées par
        notre équipe, sous 48 heures ouvrées.
      </p>

      {documents.map((doc) => {
        const file = form.documents[doc.id];

        return (
          <div key={doc.id}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-5 transition-colors",
                file
                  ? "border-trust-500/50 bg-trust-500/5"
                  : "border-marine-950/15 bg-white hover:border-gold-500 hover:bg-gold-50/50",
              )}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={(event) =>
                  attachDocument(doc.id, event.target.files?.[0] ?? null)
                }
              />

              <span
                aria-hidden="true"
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl",
                  file ? "bg-trust-500 text-white" : "bg-marine-950/6 text-marine-600",
                )}
              >
                {file ? (
                  <IconCheck className="size-5" strokeWidth={3} />
                ) : (
                  <IconUpload className="size-5" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-marine-950">
                  {doc.label}
                  {/* Plus d'astérisque rouge : la pièce est attendue pour la
                      vérification, elle ne bloque pas l'inscription. */}
                  <span
                    className={cn(
                      "text-xs font-normal",
                      doc.required ? "text-gold-700" : "text-marine-400",
                    )}
                  >
                    {doc.required ? "attendu pour la vérification" : "facultatif"}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-marine-500">
                  {file ? file.name : doc.hint}
                </span>
              </span>

              <span className="shrink-0 text-xs font-semibold text-gold-700">
                {file ? "Remplacer" : "Choisir"}
              </span>
            </label>

            {file && (
              <button
                type="button"
                onClick={() => attachDocument(doc.id, null)}
                className="mt-1.5 text-xs font-semibold text-marine-500 underline underline-offset-2 hover:text-danger-600"
              >
                Retirer ce fichier
              </button>
            )}
          </div>
        );
      })}

      <p className="text-xs/relaxed text-marine-500">
        Formats acceptés : PDF, JPG, PNG, WebP. 8 Mo par fichier au maximum.
        {provided === 0 && " Vous pouvez continuer sans rien déposer."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Étape 6 — formule et validation                                            */
/* -------------------------------------------------------------------------- */

function StepPlan({ form, set, errors }: StepProps) {
  const cabinet = form.accountType === "cabinet";

  const summary = [
    {
      label: "Type de compte",
      value: cabinet ? "Cabinet d’avocats" : "Avocat indépendant",
    },
    {
      label: cabinet ? "Dénomination" : "Nom",
      value: cabinet
        ? form.firmName
        : [form.firstName, form.lastName].filter(Boolean).join(" "),
    },
    { label: "Barreau", value: form.bar },
    {
      label: "Ville",
      value: [form.district, form.city].filter(Boolean).join(", "),
    },
    { label: "Domaines", value: form.specialties.join(" · ") },
    {
      label: "Pièces jointes",
      // Zéro pièce est désormais un cas normal : l'annoncer comme tel évite de
      // faire croire à un oubli.
      value:
        Object.keys(form.documents).length === 0
          ? "à déposer plus tard"
          : `${Object.keys(form.documents).length} fichier(s)`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold tracking-wide text-marine-950 uppercase">
          Votre formule
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <RadioCard
              key={plan.id}
              selected={form.plan === plan.id}
              onSelect={() => set("plan", plan.id)}
              title={plan.name}
              badge={
                plan.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-gold-700 uppercase">
                    <IconSparkles className="size-3" />
                    Conseillé
                  </span>
                ) : plan.id === "pionnier" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-marine-950/6 px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-marine-700 uppercase">
                    <IconCrown className="size-3" />
                    Lancement
                  </span>
                ) : undefined
              }
            >
              <span className="mt-3 flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold text-gold-700">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-xs text-marine-500">{plan.period}</span>
                )}
              </span>

              <span className="mt-2 block text-sm/relaxed text-marine-600">
                {plan.pitch}
              </span>

              <ul className="mt-4 space-y-2 border-t border-marine-950/8 pt-4">
                {plan.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-[0.8rem]/snug text-marine-700"
                  >
                    <IconCheck className="mt-px size-3.5 shrink-0 text-trust-600" />
                    {perk}
                  </li>
                ))}
              </ul>
            </RadioCard>
          ))}
        </div>

        {errors.plan && (
          <p
            role="alert"
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-danger-600"
          >
            <IconAlert className="size-4 shrink-0" />
            {errors.plan}
          </p>
        )}
      </div>

      <div className="border-t border-marine-950/8 pt-8">
        <p className="text-sm font-bold tracking-wide text-marine-950 uppercase">
          Récapitulatif
        </p>

        <dl className="mt-4 divide-y divide-marine-950/6 rounded-2xl bg-marine-50 px-5">
          {summary.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
            >
              <dt className="text-sm text-marine-500">{row.label}</dt>
              <dd className="text-right text-sm font-semibold text-marine-950">
                {row.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-3 border-t border-marine-950/8 pt-8">
        <CheckboxField
          id="acceptCharter"
          checked={form.acceptCharter}
          onChange={(value) => set("acceptCharter", value)}
          error={errors.acceptCharter}
          label={
            <>
              J’adhère à la{" "}
              <Link href="/charte-deontologique" className="font-semibold text-gold-700 underline">
                charte déontologique
              </Link>{" "}
              de TakeALawyer.
            </>
          }
          description="Secret professionnel, indépendance, interdiction du démarchage."
        />

        <CheckboxField
          id="acceptTerms"
          checked={form.acceptTerms}
          onChange={(value) => set("acceptTerms", value)}
          error={errors.acceptTerms}
          label={
            <>
              J’accepte les{" "}
              <Link href="/cgu" className="font-semibold text-gold-700 underline">
                conditions générales
              </Link>{" "}
              d’utilisation.
            </>
          }
        />

        <CheckboxField
          id="acceptData"
          checked={form.acceptData}
          onChange={(value) => set("acceptData", value)}
          error={errors.acceptData}
          label="J’autorise la vérification de mes pièces auprès de mon Barreau."
          description="Nécessaire à l’obtention du badge « Avocat vérifié »."
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirmation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Écran de fin.
 *
 * Le compte existe et la session est ouverte : « Préparer ma vitrine » mène
 * réellement à l'espace praticien, sans nouvelle connexion.
 */
function SubmissionDone({
  form,
  account,
  failedUploads,
}: {
  form: SignupForm;
  account: ApiAccount;
  failedUploads: string[];
}) {
  const documents = requiredDocuments(form.accountType);
  const missing = documents.filter((doc) => doc.required && !form.documents[doc.id]);
  const name = account.name || "Maître";

  const label = (id: string) => documents.find((doc) => doc.id === id)?.label ?? id;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-marine-950/6 sm:p-12">
      <span
        className="mx-auto grid size-16 place-items-center rounded-2xl bg-trust-500/12 text-trust-600"
        aria-hidden="true"
      >
        <IconBadgeCheck className="size-8" />
      </span>

      <h2 className="mt-6 font-serif text-2xl/snug font-bold text-marine-950 sm:text-3xl/snug">
        Votre compte est créé, {name}.
      </h2>

      <p className="mt-4 text-marine-600">
        Il est rattaché à{" "}
        <span className="font-semibold text-marine-950">{account.email}</span>.
        Notre équipe contrôle votre inscription auprès du{" "}
        <span className="font-semibold text-marine-950">{account.bar}</span> sous
        48 heures ouvrées.
      </p>

      {/* Pièces dont le dépôt a échoué : le compte est bien créé, seul le
          téléversement a échoué. Le dire évite de croire le dossier complet. */}
      {failedUploads.length > 0 && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-2xl bg-danger-50 p-4 text-left text-sm/relaxed font-medium text-danger-700 ring-1 ring-danger-200 ring-inset"
        >
          <IconAlert className="mt-0.5 size-4.5 shrink-0" />
          <span>
            {failedUploads.length === 1
              ? "Une pièce n’a pas pu être envoyée : "
              : "Certaines pièces n’ont pas pu être envoyées : "}
            {failedUploads.map(label).join(", ")}. Reprenez-les depuis votre
            espace, votre compte est bien créé.
          </span>
        </p>
      )}

      {missing.length > 0 && failedUploads.length === 0 && (
        <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-gold-50 p-4 text-left text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <IconUpload className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          <span>
            Il reste {missing.length === 1 ? "une pièce" : `${missing.length} pièces`} à
            fournir pour lancer la vérification :{" "}
            {missing.map((doc) => doc.label).join(", ")}. Déposez-{missing.length === 1 ? "la" : "les"}{" "}
            quand vous voulez depuis votre espace.
          </span>
        </p>
      )}

      <ol className="mt-8 space-y-3 text-left">
        {[
          missing.length > 0
            ? "Dépôt des pièces justificatives depuis votre espace"
            : "Vérification des pièces et de l’inscription au Barreau",
          "Attribution du badge « Avocat vérifié »",
          "Mise en ligne de votre vitrine publique",
        ].map((item, index) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-800"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-marine-950 text-xs font-bold text-white">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/avocats/espace-praticien"
          className={buttonStyles({ size: "md" })}
        >
          Préparer ma vitrine
          <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/avocats/nadege-fokou"
          className={buttonStyles({
            variant: "outline",
            size: "md",
            className: "border-marine-950/15",
          })}
        >
          Voir un exemple de vitrine
        </Link>
      </div>
    </div>
  );
}
