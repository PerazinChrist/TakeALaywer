import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { IconAlert, IconCheck, IconChevronDown } from "@/components/ui/icons";

/**
 * Primitives de formulaire.
 * Faites main, comme le reste de l'interface : ni radix ni react-hook-form ne
 * sont installés. Chaque contrôle accepte `invalid` pour porter l'état d'erreur
 * — le message, lui, est rendu par `Field`.
 */

const control =
  "w-full rounded-xl border bg-white text-[0.95rem] text-marine-950 transition-colors placeholder:text-marine-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-marine-50";

const controlTone = (invalid?: boolean) =>
  invalid
    ? "border-danger-500 focus:border-danger-600 focus:ring-2 focus:ring-danger-500/25"
    : "border-marine-950/15 hover:border-marine-950/30 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25";

/* -------------------------------------------------------------------------- */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-1.5 text-sm font-semibold text-marine-900"
      >
        {label}
        {required && (
          <span className="text-danger-600" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="text-xs font-normal text-marine-400">facultatif</span>
        )}
      </label>

      {hint && <p className="text-xs/relaxed text-marine-500">{hint}</p>}

      {children}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-xs/relaxed font-medium text-danger-600"
        >
          <IconAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function TextInput({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(control, controlTone(invalid), "h-12 px-4", className)}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(control, controlTone(invalid), "min-h-28 p-4 leading-relaxed", className)}
    />
  );
}

export function SelectInput({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(
          control,
          controlTone(invalid),
          "h-12 appearance-none pr-11 pl-4",
          className,
        )}
      >
        {children}
      </select>
      <IconChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-marine-400"
        aria-hidden="true"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function CheckboxField({
  checked,
  onChange,
  label,
  description,
  error,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: ReactNode;
  description?: string;
  error?: string;
  id: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
          error
            ? "border-danger-500 bg-danger-50"
            : checked
              ? "border-gold-500/45 bg-gold-50"
              : "border-marine-950/12 bg-white hover:border-marine-950/25",
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
            checked
              ? "border-gold-600 bg-gold-500 text-marine-950"
              : "border-marine-950/25 bg-white",
          )}
        >
          {checked && <IconCheck className="size-3.5" strokeWidth={3} />}
        </span>

        <span className="min-w-0">
          <span className="block text-sm/relaxed text-marine-900">{label}</span>
          {description && (
            <span className="mt-1 block text-xs/relaxed text-marine-500">
              {description}
            </span>
          )}
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger-600"
        >
          <IconAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Grande carte à cocher — choix structurants (type de compte, formule). */
export function RadioCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  badge,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex h-full flex-col rounded-3xl border-2 p-6 text-left transition-all duration-200",
        selected
          ? "border-gold-500 bg-gold-50/60 shadow-card"
          : "border-marine-950/10 bg-white hover:border-marine-950/25 hover:shadow-card",
      )}
    >
      <span className="flex items-start justify-between gap-3">
        {icon && (
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl transition-colors",
              selected
                ? "bg-gold-500 text-marine-950"
                : "bg-marine-950/6 text-marine-700",
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <span className="flex items-center gap-2">
          {badge}
          <span
            aria-hidden="true"
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
              selected
                ? "border-gold-600 bg-gold-500 text-marine-950"
                : "border-marine-950/20 bg-white",
            )}
          >
            {selected && <IconCheck className="size-3.5" strokeWidth={3} />}
          </span>
        </span>
      </span>

      <span className="mt-5 block font-serif text-xl/snug font-bold text-marine-950">
        {title}
      </span>

      {description && (
        <span className="mt-2 block text-sm/relaxed text-marine-600">
          {description}
        </span>
      )}

      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */

/** Sélection multiple compacte — domaines du droit, langues de travail. */
export function ChipToggle({
  active,
  onToggle,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-gold-500 bg-gold-500 text-marine-950"
          : "border-marine-950/15 bg-white text-marine-700 hover:border-marine-950/35",
      )}
    >
      {active && <IconCheck className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}
