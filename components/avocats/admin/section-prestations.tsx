"use client";

import { useState } from "react";
import {
  AdminCard,
  Feedback,
  Modal,
  RowActions,
} from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { buttonStyles } from "@/components/ui/button";
import { CheckboxField, Field, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { del, patchJson, postJson } from "@/lib/api/client";
import { formatFcfa } from "@/lib/utils";
import type { Prestation } from "@/lib/data/lawyer-profile";
import { IconPlus, IconScale } from "@/components/ui/icons";

/** Modes de délivrance — alignés sur TAL_Referentials::prestation_modes(). */
const modes: { id: Prestation["mode"]; label: string }[] = [
  { id: "visio", label: "Visioconférence" },
  { id: "cabinet", label: "Au cabinet" },
  { id: "telephone", label: "Téléphone" },
  { id: "document", label: "Sur document" },
];

const modeLabels = Object.fromEntries(modes.map(({ id, label }) => [id, label])) as Record<
  Prestation["mode"],
  string
>;

/**
 * Prestations tarifées.
 *
 * Le tarif affiché est le premier critère de choix cité par les citoyens : la
 * section pousse donc à en déclarer, quitte à ce qu'ils soient indicatifs.
 */
export function SectionPrestations({
  prestations,
  onChange,
}: {
  prestations: Prestation[];
  onChange: (prestations: Prestation[]) => void;
}) {
  const { run, pending, error, done } = useAdminAction();
  const [editing, setEditing] = useState<Prestation | null>(null);
  const [creating, setCreating] = useState(false);

  const adopt = (data: { items?: Prestation[] } | null) => {
    if (data?.items) onChange(data.items);
  };

  return (
    <div className="space-y-5">
      <Feedback error={error} done={done} doneLabel="Prestations mises à jour." />

      <AdminCard
        title={`Prestations · ${prestations.length}`}
        description="Les tarifs affichés sur votre vitrine. Un honoraire annoncé rassure : c’est le premier critère de choix cité par les citoyens."
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={buttonStyles({ size: "sm" })}
          >
            <IconPlus className="size-4" />
            Ajouter
          </button>
        }
      >
        {prestations.length === 0 ? (
          <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            <IconScale className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
            Aucune prestation tarifée. Commencez par la plus demandée — une
            première consultation, par exemple — même à titre indicatif.
          </p>
        ) : (
          <ul className="space-y-3">
            {prestations.map((prestation) => (
              <li
                key={prestation.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-marine-950/8 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-marine-950">
                    {prestation.title}
                    {prestation.popular && (
                      <span className="rounded-full bg-gold-500/12 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-gold-700 uppercase">
                        Le plus demandé
                      </span>
                    )}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-marine-500">
                    {prestation.description || modeLabels[prestation.mode]}
                  </p>
                </div>

                <p className="shrink-0 text-right">
                  <span className="block font-serif text-lg font-bold text-marine-950">
                    {formatFcfa(prestation.price)}
                  </span>
                  <span className="text-xs text-marine-500">
                    {prestation.unit || modeLabels[prestation.mode]}
                  </span>
                </p>

                <RowActions
                  label={prestation.title}
                  busy={pending}
                  onEdit={() => setEditing(prestation)}
                  onDelete={() =>
                    run<{ items: Prestation[] }>(
                      () => del(`/api/avocats/prestations/${prestation.id}`),
                      adopt,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <Modal
        open={creating || editing !== null}
        title={editing ? "Modifier la prestation" : "Nouvelle prestation"}
        description="Elle apparaîtra dans l’onglet « Prestations » de votre vitrine."
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <PrestationForm
          key={editing?.id ?? "nouvelle"}
          prestation={editing}
          pending={pending}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (values) => {
            const saved = editing
              ? await run<{ items: Prestation[] }>(
                  () => patchJson(`/api/avocats/prestations/${editing.id}`, values),
                  adopt,
                )
              : await run<{ items: Prestation[] }>(
                  () => postJson("/api/avocats/prestations", values),
                  adopt,
                );

            if (saved) {
              setCreating(false);
              setEditing(null);
            }
          }}
        />
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PrestationForm({
  prestation,
  pending,
  onSubmit,
  onClose,
}: {
  prestation: Prestation | null;
  pending: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(prestation?.title ?? "");
  const [description, setDescription] = useState(prestation?.description ?? "");
  const [price, setPrice] = useState(String(prestation?.price ?? 0));
  const [unit, setUnit] = useState(prestation?.unit ?? "");
  const [mode, setMode] = useState<Prestation["mode"]>(prestation?.mode ?? "visio");
  const [popular, setPopular] = useState(prestation?.popular ?? false);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          title: title.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          unit: unit.trim(),
          mode,
          popular,
        });
      }}
    >
      <Field label="Intitulé" htmlFor="prestationTitle" required>
        <TextInput
          id="prestationTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Première consultation"
        />
      </Field>

      <Field label="Description" htmlFor="prestationDescription" optional>
        <TextArea
          id="prestationDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="45 minutes pour poser le cadre juridique de votre dossier et vous dire ce qui est possible."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tarif (FCFA)" htmlFor="prestationPrice" hint="0 pour un premier échange offert.">
          <TextInput
            id="prestationPrice"
            type="number"
            min={0}
            step={500}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>

        <Field
          label="Unité"
          htmlFor="prestationUnit"
          optional
          hint="Affichée sous le tarif."
        >
          <TextInput
            id="prestationUnit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="la consultation"
          />
        </Field>

        <Field label="Mode" htmlFor="prestationMode" className="sm:col-span-2">
          <SelectInput
            id="prestationMode"
            value={mode}
            onChange={(event) => setMode(event.target.value as Prestation["mode"])}
          >
            {modes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <CheckboxField
        id="prestationPopular"
        checked={popular}
        onChange={setPopular}
        label="Mettre en avant comme « Le plus demandé »"
        description="Une seule prestation gagne à porter cette mention."
      />

      <div className="flex flex-wrap justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            className: "border-marine-950/15",
          })}
        >
          Annuler
        </button>
        <button type="submit" disabled={pending} className={buttonStyles({ size: "sm" })}>
          {pending ? "Enregistrement…" : prestation ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
