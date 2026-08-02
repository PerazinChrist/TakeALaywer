"use client";

import { useState } from "react";
import {
  AdminCard,
  Feedback,
  Modal,
  RowActions,
} from "@/components/avocats/admin/admin-ui";
import { useAdminAction } from "@/components/avocats/admin/use-admin-action";
import { PhotoTile } from "@/components/avocats/vitrine/photo-tile";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { del, patchJson, postForm, postJson } from "@/lib/api/client";
import type { GalleryAlbum } from "@/lib/data/lawyer-profile";
import { IconImage, IconPlus, IconUpload } from "@/components/ui/icons";

/**
 * Photos & albums.
 *
 * Toutes les écritures renvoient la liste d'albums recalculée par le plugin :
 * la section adopte cette liste plutôt que de deviner localement l'effet d'un
 * ajout. Une photo créée arrive donc avec son URL définitive, sa position et sa
 * date — trois choses que le navigateur ne peut pas inventer.
 */
export function SectionGalerie({
  albums,
  onChange,
}: {
  albums: GalleryAlbum[];
  onChange: (albums: GalleryAlbum[]) => void;
}) {
  const { run, pending, error, done } = useAdminAction();
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const total = albums.reduce((count, album) => count + album.photos.length, 0);

  const adopt = (data: { items?: GalleryAlbum[] } | null) => {
    if (data?.items) onChange(data.items);
  };

  const addPhotos = async (albumId: string, files: FileList) => {
    setUploading(albumId);

    const body = new FormData();

    for (const file of Array.from(files)) body.append("file", file);

    await run<{ items: GalleryAlbum[] }>(
      () => postForm(`/api/avocats/albums/${albumId}/photos`, body),
      adopt,
    );

    setUploading(null);
  };

  return (
    <div className="space-y-5">
      <Feedback error={error} done={done} doneLabel="Galerie mise à jour." />

      <AdminCard
        title={`Albums · ${albums.length}`}
        description={
          total > 0
            ? `${total} photo${total > 1 ? "s" : ""} en ligne. Chaque album apparaît dans l’onglet « Galerie » de votre vitrine.`
            : "Créez un premier album — cabinet, équipe, interventions — puis déposez-y vos photos."
        }
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={buttonStyles({ size: "sm" })}
          >
            <IconPlus className="size-4" />
            Nouvel album
          </button>
        }
      >
        {albums.length === 0 && (
          <p className="flex items-start gap-2.5 rounded-2xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
            <IconImage className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
            Aucun album pour l’instant. Les vitrines avec photos reçoivent
            nettement plus de demandes — une salle d’attente, une façade, une
            équipe suffisent.
          </p>
        )}

        <p className="text-xs/relaxed text-marine-500">
          JPG, PNG ou WebP, 5 Mo par image. Évitez toute photo de client ou de
          pièce de dossier : la vitrine est publique.
        </p>
      </AdminCard>

      {albums.map((album) => (
        <AdminCard
          key={album.id}
          title={album.title}
          description={[album.description, `${album.photos.length} photos`, album.updatedAt]
            .filter(Boolean)
            .join(" · ")}
          action={
            <RowActions
              label={`l’album ${album.title}`}
              busy={pending}
              onEdit={() => setEditing(album)}
              onDelete={() =>
                run<{ items: GalleryAlbum[] }>(
                  () => del(`/api/avocats/albums/${album.id}`),
                  adopt,
                )
              }
            />
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {album.photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                caption={photo.caption}
                tone={photo.tone}
                url={photo.url}
                className="aspect-square"
                overlay={
                  <span className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <RowActions
                      label={photo.caption || "cette photo"}
                      onSurface
                      busy={pending}
                      onDelete={() =>
                        run<{ items: GalleryAlbum[] }>(
                          () => del(`/api/avocats/photos/${photo.id}`),
                          adopt,
                        )
                      }
                    />
                  </span>
                }
              />
            ))}

            <label
              className={cnUpload(uploading === album.id)}
              aria-busy={uploading === album.id}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading === album.id}
                onChange={(event) => {
                  const files = event.target.files;

                  if (files && files.length > 0) void addPhotos(album.id, files);
                  // Réinitialiser permet de redéposer le même fichier après un
                  // refus : sinon, resélectionner le même nom n'émet rien.
                  event.target.value = "";
                }}
              />
              {uploading === album.id ? (
                <>
                  <IconUpload className="size-6 animate-pulse" />
                  <span className="text-xs font-semibold">Envoi…</span>
                </>
              ) : (
                <>
                  <IconPlus className="size-6" />
                  <span className="text-xs font-semibold">Ajouter</span>
                </>
              )}
            </label>
          </div>
        </AdminCard>
      ))}

      <AlbumDialog
        open={creating || editing !== null}
        album={editing}
        pending={pending}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={async (values) => {
          const saved = editing
            ? await run<{ items: GalleryAlbum[] }>(
                () => patchJson(`/api/avocats/albums/${editing.id}`, values),
                adopt,
              )
            : await run<{ items: GalleryAlbum[] }>(
                () => postJson("/api/avocats/albums", values),
                adopt,
              );

          if (saved) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Création et modification d'un album — même formulaire, deux intentions. */
function AlbumDialog({
  open,
  album,
  pending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  album: GalleryAlbum | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; description: string }) => void;
}) {
  return (
    <Modal
      open={open}
      title={album ? "Modifier l’album" : "Nouvel album"}
      description="Le titre apparaît en tête de la galerie, la description juste en dessous."
      onClose={onClose}
    >
      {/* `key` force le remontage entre deux albums : sans elle, l'état du
          formulaire précédent resterait affiché. */}
      <AlbumForm
        key={album?.id ?? "nouveau"}
        album={album}
        pending={pending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function AlbumForm({
  album,
  pending,
  onClose,
  onSubmit,
}: {
  album: GalleryAlbum | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(album?.title ?? "");
  const [description, setDescription] = useState(album?.description ?? "");

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ title: title.trim(), description: description.trim() });
      }}
    >
      <Field label="Titre de l’album" htmlFor="albumTitle" required>
        <TextInput
          id="albumTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Le cabinet"
        />
      </Field>

      <Field label="Description" htmlFor="albumDescription" optional>
        <TextArea
          id="albumDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Nos locaux à Bonanjo, ouverts du lundi au vendredi."
        />
      </Field>

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
          {pending ? "Enregistrement…" : album ? "Enregistrer" : "Créer l’album"}
        </button>
      </div>
    </form>
  );
}

/** Classe de la tuile de dépôt, selon qu'un envoi est en cours. */
function cnUpload(busy: boolean): string {
  return [
    "grid aspect-square cursor-pointer place-items-center gap-1.5 rounded-2xl border-2 border-dashed transition-colors",
    busy
      ? "border-gold-500 bg-gold-50/60 text-gold-700"
      : "border-marine-950/15 text-marine-500 hover:border-gold-500 hover:text-gold-700",
  ].join(" ");
}
