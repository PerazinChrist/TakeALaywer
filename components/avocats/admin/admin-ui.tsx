"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import {
  IconAlert,
  IconCheck,
  IconClose,
  IconPencil,
  IconTrash,
} from "@/components/ui/icons";

/** Briques communes aux sections de l'espace de gestion. */

export function AdminCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-7",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-bold text-marine-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm/relaxed text-marine-600">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-marine-950/6">
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid size-10 place-items-center rounded-xl bg-gold-500/12 text-gold-700"
          aria-hidden="true"
        >
          {icon}
        </span>
        {trend && (
          <span className="rounded-full bg-trust-500/10 px-2 py-0.5 text-[0.7rem] font-bold text-trust-600">
            {trend}
          </span>
        )}
      </div>
      <p className=""><span className="mt-1 font-serif text-1xl font-bold text-marine-950">{value}</span> <span className="mt-0.5 text-sm text-marine-500">{label}</span></p>
      </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Interrupteur de visibilité.
 *
 * Contrôlé lorsque `on` et `onToggle` sont fournis, autonome sinon : quelques
 * options de la vitrine ne sont pas encore portées par le backend, et un
 * interrupteur figé donnerait l'impression d'une panne.
 */
export function Toggle({
  label,
  description,
  defaultOn = false,
  on: controlled,
  onToggle,
  disabled,
}: {
  label: string;
  description?: string;
  defaultOn?: boolean;
  on?: boolean;
  onToggle?: (next: boolean) => void;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState(defaultOn);
  const on = controlled ?? internal;

  const toggle = () => {
    const next = !on;

    if (onToggle) onToggle(next);
    else setInternal(next);
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-marine-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs/relaxed text-marine-500">
            {description}
          </span>
        )}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          on ? "bg-trust-500" : "bg-marine-950/20",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
            on ? "left-[1.375rem]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Paire modifier / supprimer, posée en bout de ligne ou sur une vignette.
 *
 * La suppression demande confirmation dans le bouton lui-même : une boîte de
 * dialogue native serait plus brutale, et un album supprimé emporte ses photos.
 */
export function RowActions({
  label,
  onSurface = false,
  onEdit,
  onDelete,
  busy = false,
}: {
  label: string;
  onSurface?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  busy?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  // La demande de confirmation retombe seule : un bouton rouge resté armé
  // au fond d'une liste finirait par être cliqué par erreur.
  useEffect(() => {
    if (!confirming) return;

    const timer = setTimeout(() => setConfirming(false), 5000);

    return () => clearTimeout(timer);
  }, [confirming]);

  const base = onSurface
    ? "bg-white/90 text-marine-800 backdrop-blur-sm hover:bg-white"
    : "bg-marine-50 text-marine-600 hover:bg-marine-100 hover:text-marine-900";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {confirming ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setConfirming(false);
              onDelete?.();
            }}
            className="rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-700 disabled:opacity-60"
          >
            {busy ? "Suppression…" : "Confirmer"}
          </button>
          <button
            type="button"
            aria-label="Annuler la suppression"
            onClick={() => setConfirming(false)}
            className={cn("grid size-8 place-items-center rounded-lg transition-colors", base)}
          >
            <IconClose className="size-4" />
          </button>
        </>
      ) : (
        <>
          {onEdit && (
            <button
              type="button"
              aria-label={`Modifier ${label}`}
              onClick={onEdit}
              className={cn("grid size-8 place-items-center rounded-lg transition-colors", base)}
            >
              <IconPencil className="size-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Supprimer ${label}`}
              onClick={() => setConfirming(true)}
              className={cn(
                "grid size-8 place-items-center rounded-lg transition-colors",
                onSurface
                  ? "bg-white/90 text-danger-600 backdrop-blur-sm hover:bg-white"
                  : "bg-marine-50 text-marine-600 hover:bg-danger-50 hover:text-danger-600",
              )}
            >
              <IconTrash className="size-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Bandeau d'erreur ou de confirmation, au-dessus d'un formulaire. */
export function Feedback({
  error,
  done,
  doneLabel = "Modifications enregistrées.",
}: {
  error?: string;
  done?: boolean;
  doneLabel?: string;
}) {
  if (!error && !done) return null;

  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-2xl p-4 text-sm/relaxed font-medium ring-1 ring-inset",
        error
          ? "bg-danger-50 text-danger-700 ring-danger-200"
          : "bg-trust-500/8 text-trust-700 ring-trust-500/25",
      )}
    >
      {error ? (
        <IconAlert className="mt-0.5 size-4.5 shrink-0" />
      ) : (
        <IconCheck className="mt-0.5 size-4.5 shrink-0" strokeWidth={3} />
      )}
      {error || doneLabel}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Barre d'enregistrement collée en bas de section.
 *
 * Elle ne s'affiche qu'une fois quelque chose modifié : présente en permanence,
 * elle mangerait une bande de l'écran sur mobile pour rien.
 */
export function SaveBar({
  dirty,
  pending,
  done,
  onSave,
  onReset,
}: {
  dirty: boolean;
  pending: boolean;
  done: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  if (!dirty && !done) return null;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-marine-950 p-4 text-white shadow-marine">
      <p className="text-sm text-marine-200">
        {done && !dirty
          ? "Vitrine à jour — les visiteurs voient déjà la nouvelle version."
          : "Modifications non enregistrées."}
      </p>

      {dirty && (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            disabled={pending}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className={buttonStyles({ size: "sm" })}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Boîte de dialogue modale — création et modification d'un guide, d'un album.
 *
 * `<dialog>` natif plutôt qu'un div en position fixe : le navigateur gère la
 * capture du focus, la fermeture par Échap et le voile d'arrière-plan, trois
 * choses qu'une réimplémentation rate presque toujours.
 */
export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialog.current;

    if (!node) return;

    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      aria-label={title}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] rounded-3xl bg-white p-0 text-marine-950 shadow-marine backdrop:bg-marine-950/55 backdrop:backdrop-blur-sm",
        wide ? "max-w-3xl" : "max-w-xl",
      )}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-serif text-xl font-bold text-marine-950">{title}</h2>
              {description && (
                <p className="mt-1 text-sm/relaxed text-marine-600">{description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-marine-50 text-marine-600 transition-colors hover:bg-marine-100 hover:text-marine-950"
            >
              <IconClose className="size-4" />
            </button>
          </div>

          {children}
        </div>
      )}
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */

export function StatusPill({ status }: { status: "publie" | "brouillon" }) {
  const published = status === "publie";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase ring-1 ring-inset",
        published
          ? "bg-trust-500/10 text-trust-600 ring-trust-500/25"
          : "bg-marine-950/5 text-marine-600 ring-marine-950/10",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          published ? "bg-trust-500" : "bg-marine-400",
        )}
      />
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}
