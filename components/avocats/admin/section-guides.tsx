"use client";

import { useState } from "react";
import {
  AdminCard,
  Feedback,
  Modal,
  RowActions,
  StatusPill,
} from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { buttonStyles } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { RichTextEditor } from "@/components/ui/rich-text";
import { del, postForm } from "@/lib/api/client";
import { cn, formatFcfa } from "@/lib/utils";
import { specialties } from "@/lib/data/home";
import type { GuideFormat, ProfileGuide } from "@/lib/data/lawyer-profile";
import {
  IconAlert,
  IconDownload,
  IconEye,
  IconFileText,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUpload,
} from "@/components/ui/icons";

/**
 * Guides & modèles publiés.
 *
 * Un guide se livre de deux façons, et c'est le choix structurant du formulaire :
 * soit le praticien dépose un PDF déjà mis en page, soit il rédige directement
 * dans l'éditeur. Les deux mènent à la même fiche de vente — titre, description,
 * catégorie, prix — et le même guide peut basculer de l'un à l'autre sans perdre
 * ce qui a déjà été saisi.
 */
export function SectionGuides({
  guides,
  onChange,
}: {
  guides: ProfileGuide[];
  onChange: (guides: ProfileGuide[]) => void;
}) {
  const { run, pending, error, done } = useAdminAction();
  const [editing, setEditing] = useState<ProfileGuide | null>(null);
  const [creating, setCreating] = useState(false);

  const adopt = (data: { items?: ProfileGuide[] } | null) => {
    if (data?.items) onChange(data.items);
  };

  const published = guides.filter((guide) => guide.status === "publie").length;

  return (
    <div className="space-y-5">
      <Feedback error={error} done={done} doneLabel="Bibliothèque mise à jour." />

      <AdminCard
        title={`Guides & modèles · ${guides.length}`}
        description={`${published} publié${published > 1 ? "s" : ""}. La plateforme retient 20 % sur chaque vente, 10 % avec l’offre Pionnier.`}
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={buttonStyles({ size: "sm" })}
          >
            <IconPlus className="size-4" />
            Publier un guide
          </button>
        }
      >
        {guides.length === 0 ? (
          <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            <IconFileText className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
            Aucun guide pour l’instant. Un modèle d’acte commenté ou une note de
            dix pages sur une question fréquente se vend tous les jours, sans
            consultation.
          </p>
        ) : (
          <ul className="divide-y divide-marine-950/6">
            {guides.map((guide) => (
              <li
                key={guide.id ?? guide.slug}
                className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl font-serif text-xs font-bold",
                    guide.format === "texte"
                      ? "bg-trust-500/12 text-trust-700"
                      : guide.kind === "modele"
                        ? "bg-marine-950/6 text-marine-700"
                        : "bg-gold-500/12 text-gold-700",
                  )}
                  aria-hidden="true"
                >
                  {guide.format === "texte" ? "TXT" : guide.kind === "modele" ? "MOD" : "PDF"}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-marine-950">{guide.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-marine-500">
                    <span>{guide.category || "Sans catégorie"}</span>
                    {guide.pages > 0 && <span>{guide.pages} pages</span>}
                    <span className="inline-flex items-center gap-1">
                      <IconDownload className="size-3.5" />
                      {guide.downloads}
                    </span>
                    {guide.format === "pdf" && !guide.hasFile && (
                      <span className="inline-flex items-center gap-1 font-semibold text-gold-700">
                        <IconAlert className="size-3.5" />
                        PDF manquant
                      </span>
                    )}
                  </p>
                </div>

                <span className="shrink-0 font-serif text-lg font-bold text-marine-950">
                  {formatFcfa(guide.price)}
                </span>

                <StatusPill status={guide.status} />

                <RowActions
                  label={guide.title}
                  busy={pending}
                  onEdit={() => setEditing(guide)}
                  onDelete={() =>
                    run<{ items: ProfileGuide[] }>(
                      () => del(`/api/avocats/guides/${guide.id}`),
                      adopt,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard
        title="Revenus"
        description="Versés par Mobile Money le 5 de chaque mois."
      >
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Guides en vente", value: String(published) },
            {
              label: "Prix moyen",
              value: formatFcfa(
                guides.length > 0
                  ? Math.round(guides.reduce((sum, g) => sum + g.price, 0) / guides.length)
                  : 0,
              ),
            },
            { label: "En attente de versement", value: formatFcfa(0) },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl bg-marine-50 p-5">
              <dt className="text-sm text-marine-500">{row.label}</dt>
              <dd className="mt-1 font-serif text-xl font-bold text-marine-950">{row.value}</dd>
            </div>
          ))}
        </dl>
      </AdminCard>

      <Modal
        open={creating || editing !== null}
        title={editing ? "Modifier le guide" : "Publier un guide"}
        description="Déposez un PDF déjà mis en page, ou rédigez directement le contenu."
        wide
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <GuideForm
          key={editing?.id ?? "nouveau"}
          guide={editing}
          pending={pending}
          onDropFile={async () => {
            if (!editing?.id) return;

            await run<{ items: ProfileGuide[] }>(
              () => del(`/api/avocats/guides/${editing.id}/fichier`),
              (data) => {
                adopt(data);
                setEditing(
                  data?.items?.find((item) => item.id === editing.id) ?? null,
                );
              },
            );
          }}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (body) => {
            const saved = await run<{ items: ProfileGuide[] }>(
              () =>
                postForm(
                  editing ? `/api/avocats/guides/${editing.id}` : "/api/avocats/guides",
                  body,
                ),
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

/** Catégories proposées : les domaines du droit, plus les usages transverses. */
const categories = [...specialties, "Recouvrement", "Contentieux", "Procédure"];

function GuideForm({
  guide,
  pending,
  onSubmit,
  onDropFile,
  onClose,
}: {
  guide: ProfileGuide | null;
  pending: boolean;
  onSubmit: (body: FormData) => void;
  onDropFile: () => void;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<GuideFormat>(guide?.format ?? "pdf");
  const [title, setTitle] = useState(guide?.title ?? "");
  const [description, setDescription] = useState(guide?.description ?? "");
  const [content, setContent] = useState(guide?.content ?? "");
  const [category, setCategory] = useState(guide?.category ?? "");
  const [kind, setKind] = useState(guide?.kind ?? "guide");
  const [price, setPrice] = useState(String(guide?.price ?? 250));
  const [pages, setPages] = useState(String(guide?.pages ?? 0));
  const [status, setStatus] = useState(guide?.status ?? "brouillon");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const submit = (nextStatus: "publie" | "brouillon") => {
    const body = new FormData();

    body.set("title", title.trim());
    body.set("description", description.trim());
    body.set("category", category);
    body.set("kind", kind);
    body.set("format", format);
    body.set("price", price || "0");
    body.set("pages", pages || "0");
    body.set("status", nextStatus);

    // Le contenu rédigé n'est envoyé qu'en format texte, et le PDF qu'en format
    // PDF : basculer d'un mode à l'autre ne doit pas écraser ce qui dort dans
    // l'autre, le praticien peut vouloir y revenir.
    if (format === "texte") body.set("content", content);
    if (format === "pdf" && file) body.set("file", file, file.name);
    if (cover) body.set("cover", cover, cover.name);

    setStatus(nextStatus);
    onSubmit(body);
  };

  const hasDeliverable =
    format === "texte"
      ? content.replace(/<[^>]*>/g, "").trim().length >= 200
      : Boolean(file) || Boolean(guide?.hasFile);

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      {/* ---------------- Choix du support ---------------- */}
      <Field
        label="Support du guide"
        hint="Vous pourrez changer d’avis : le contenu saisi dans l’autre mode est conservé."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                id: "pdf" as const,
                title: "Déposer un PDF",
                note: "Le document est déjà mis en page. 25 Mo au maximum.",
                Icon: IconUpload,
              },
              {
                id: "texte" as const,
                title: "Rédiger en ligne",
                note: "Titres, gras, listes et liens — comme dans un traitement de texte.",
                Icon: IconPencil,
              },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFormat(option.id)}
              aria-pressed={format === option.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                format === option.id
                  ? "border-gold-500 bg-gold-50/60"
                  : "border-marine-950/10 hover:border-marine-950/25",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  format === option.id
                    ? "bg-gold-500 text-marine-950"
                    : "bg-marine-950/6 text-marine-700",
                )}
              >
                <option.Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-marine-950">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-xs/relaxed text-marine-500">
                  {option.note}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Field>

      {/* ---------------- Fiche de vente ---------------- */}
      <Field label="Titre" htmlFor="guideTitle" required>
        <TextInput
          id="guideTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Créer sa SARL : formalités, délais et coûts réels"
        />
      </Field>

      <Field
        label="Description"
        htmlFor="guideDescription"
        hint="Les deux ou trois phrases qui décident l’achat. Dites ce que le lecteur saura faire après."
      >
        <TextArea
          id="guideDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Le parcours complet, du dépôt des statuts au RCCM, avec les frais réels constatés à Douala."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" htmlFor="guideKind">
          <SelectInput
            id="guideKind"
            value={kind}
            onChange={(event) => setKind(event.target.value as "guide" | "modele")}
          >
            <option value="guide">Guide pratique</option>
            <option value="modele">Modèle d’acte</option>
          </SelectInput>
        </Field>

        <Field label="Catégorie" htmlFor="guideCategory">
          <SelectInput
            id="guideCategory"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Sélectionnez…</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Prix (FCFA)" htmlFor="guidePrice" hint="0 pour un guide offert.">
          <TextInput
            id="guidePrice"
            type="number"
            min={0}
            step={50}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>

        <Field label="Nombre de pages" htmlFor="guidePages" optional>
          <TextInput
            id="guidePages"
            type="number"
            min={0}
            value={pages}
            onChange={(event) => setPages(event.target.value)}
          />
        </Field>
      </div>

      {/* ---------------- Le produit livré ---------------- */}
      {format === "pdf" ? (
        <Field label="Document PDF" required>
          <div className="space-y-3">
            {guide?.hasFile && !file && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-trust-500/40 bg-trust-500/5 p-4">
                <IconFileText className="size-5 shrink-0 text-trust-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-marine-950">
                    {guide.fileName || "Document déposé"}
                  </span>
                  <span className="text-xs text-marine-500">
                    {formatSize(guide.fileSize ?? 0)}
                  </span>
                </span>

                {guide.fileUrl && (
                  <a
                    href={guide.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({
                      variant: "outline",
                      size: "sm",
                      className: "border-marine-950/15",
                    })}
                  >
                    <IconEye className="size-4" />
                    Relire
                  </a>
                )}

                <button
                  type="button"
                  onClick={onDropFile}
                  disabled={pending}
                  aria-label="Retirer le PDF"
                  className="grid size-9 place-items-center rounded-lg bg-white text-marine-600 transition-colors hover:bg-danger-50 hover:text-danger-600"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-marine-950/15 p-6 text-center transition-colors hover:border-gold-500 hover:bg-gold-50/50">
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <IconUpload className="size-6 text-marine-500" />
              <span className="text-sm font-semibold text-marine-900">
                {file
                  ? file.name
                  : guide?.hasFile
                    ? "Remplacer le PDF"
                    : "Déposez votre PDF, ou cliquez pour parcourir"}
              </span>
              <span className="text-xs text-marine-500">
                {file ? formatSize(file.size) : "PDF uniquement, 25 Mo au maximum."}
              </span>
            </label>
          </div>
        </Field>
      ) : (
        <Field
          label="Contenu du guide"
          hint="200 caractères au minimum pour publier. Le lecteur retrouvera exactement cette mise en page."
        >
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Rédigez votre guide — titres, listes et passages en gras sont conservés."
          />
        </Field>
      )}

      <Field label="Image de couverture" optional hint="Illustre la fiche dans la bibliothèque.">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-marine-950/15 p-4 transition-colors hover:border-gold-500 hover:bg-gold-50/50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => setCover(event.target.files?.[0] ?? null)}
          />
          <IconUpload className="size-5 shrink-0 text-marine-500" />
          <span className="min-w-0 flex-1 truncate text-sm text-marine-700">
            {cover?.name ?? (guide?.coverUrl ? "Remplacer la couverture" : "Aucune image")}
          </span>
          <span className="shrink-0 text-xs font-semibold text-gold-700">Parcourir</span>
        </label>
      </Field>

      {/* ---------------- Actions ---------------- */}
      {!hasDeliverable && (
        <p className="flex items-start gap-2.5 rounded-2xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <IconAlert className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          {format === "texte"
            ? "Rédigez au moins 200 caractères pour pouvoir publier. Vous pouvez enregistrer un brouillon dès maintenant."
            : "Déposez le PDF pour pouvoir publier. Vous pouvez enregistrer un brouillon dès maintenant."}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2.5">
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

        <button
          type="button"
          disabled={pending || title.trim() === ""}
          onClick={() => submit("brouillon")}
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            className: "border-marine-950/15",
          })}
        >
          {pending && status === "brouillon" ? "Enregistrement…" : "Enregistrer en brouillon"}
        </button>

        <button
          type="button"
          disabled={pending || !hasDeliverable || title.trim() === ""}
          onClick={() => submit("publie")}
          className={buttonStyles({ size: "sm" })}
        >
          {pending && status === "publie" ? "Publication…" : "Publier"}
        </button>
      </div>
    </form>
  );
}

/** Taille de fichier en unité lisible. */
function formatSize(bytes: number): string {
  if (bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;

  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
