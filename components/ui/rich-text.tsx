"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconBold,
  IconEraser,
  IconHeading,
  IconItalic,
  IconLink,
  IconList,
  IconListOrdered,
  IconQuote,
  IconUnderline,
} from "@/components/ui/icons";

/**
 * Éditeur de texte mis en forme, fait main.
 *
 * Ni TipTap ni Quill ne sont installés — la règle du projet est de n'ajouter
 * aucune dépendance d'interface. Un `contentEditable` piloté par
 * `document.execCommand` couvre exactement ce dont un guide a besoin : gras,
 * italique, souligné, titres, listes, citation et liens.
 *
 * `execCommand` est marqué obsolète par la spécification, sans remplacement
 * normalisé ni date de retrait : tous les navigateurs l'implémentent encore, et
 * les éditeurs légers reposent dessus. Le jour où il disparaîtra, seul ce
 * fichier sera à reprendre — le contenu est stocké en HTML, pas dans un format
 * propriétaire.
 *
 * Le HTML produit n'est jamais cru sur parole : le plugin le repasse par
 * `wp_kses_post` avant écriture, et un contenu relu vient donc toujours de cette
 * liste blanche.
 */

type ToolbarCommand = {
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  /** Commande `execCommand`, ou « link » pour le cas particulier du lien. */
  command: string;
  argument?: string;
  /** Commande interrogée par `queryCommandState` pour l'état actif du bouton. */
  state?: string;
};

/**
 * Descripteurs de la barre d'outils.
 *
 * Défini hors du composant, et sous forme de données plutôt que de fonctions :
 * des closures créées à chaque rendu liraient la référence de la zone
 * d'édition, ce que le compilateur React refuse à juste titre.
 */
const COMMANDS: ToolbarCommand[] = [
  { label: "Gras", Icon: IconBold, command: "bold", state: "bold" },
  { label: "Italique", Icon: IconItalic, command: "italic", state: "italic" },
  { label: "Souligné", Icon: IconUnderline, command: "underline", state: "underline" },
  { label: "Titre", Icon: IconHeading, command: "formatBlock", argument: "<h3>" },
  {
    label: "Liste à puces",
    Icon: IconList,
    command: "insertUnorderedList",
    state: "insertUnorderedList",
  },
  {
    label: "Liste numérotée",
    Icon: IconListOrdered,
    command: "insertOrderedList",
    state: "insertOrderedList",
  },
  { label: "Citation", Icon: IconQuote, command: "formatBlock", argument: "<blockquote>" },
  { label: "Lien", Icon: IconLink, command: "link" },
  { label: "Retirer la mise en forme", Icon: IconEraser, command: "removeFormat" },
];

/** Commandes dont l'état actif est relu après chaque frappe ou clic. */
const TRACKED = COMMANDS.map((item) => item.state).filter(
  (state): state is string => Boolean(state),
);

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez votre guide…",
  className,
  id,
}: {
  /** HTML initial. Relu seulement lorsqu'il diffère du contenu affiché. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const fallbackId = useId();
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [empty, setEmpty] = useState(true);

  // Le HTML n'est posé que lorsqu'il diffère de ce que contient déjà la zone.
  // Le réécrire à chaque rendu replacerait le curseur en tête à chaque frappe.
  useEffect(() => {
    const node = editor.current;

    if (node && node.innerHTML !== value) {
      node.innerHTML = value;
      setEmpty(node.textContent?.trim() === "");
    }
  }, [value]);

  function refreshState() {
    const states: Record<string, boolean> = {};

    for (const command of TRACKED) {
      try {
        states[command] = document.queryCommandState(command);
      } catch {
        // Certains navigateurs lèvent hors focus : l'état actif est cosmétique.
        states[command] = false;
      }
    }

    setActive(states);
  }

  function sync() {
    const node = editor.current;

    if (!node) return;

    setEmpty(node.textContent?.trim() === "");
    onChange(node.innerHTML);
  }

  /** Applique une commande de la barre d'outils, puis rend la main à la zone. */
  function apply(item: ToolbarCommand) {
    editor.current?.focus();

    if (item.command === "link") {
      const url = askForUrl();

      if (url) document.execCommand("createLink", false, url);
    } else if (item.command === "removeFormat") {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand(item.command, false, item.argument);
    }

    sync();
    refreshState();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-marine-950/15 bg-white transition-colors focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/25",
        className,
      )}
    >
      <div
        role="toolbar"
        aria-label="Mise en forme"
        className="flex flex-wrap gap-0.5 border-b border-marine-950/8 bg-marine-50/70 p-1.5"
      >
        {COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={item.state ? (active[item.state] ?? false) : undefined}
            // `onMouseDown` plutôt que `onClick` : un clic déplacerait le focus
            // hors de la zone d'édition avant la commande, et la sélection —
            // donc le texte à mettre en gras — serait perdue.
            onMouseDown={(event) => {
              event.preventDefault();
              apply(item);
            }}
            className={cn(
              "grid size-8 place-items-center rounded-lg transition-colors",
              item.state && active[item.state]
                ? "bg-marine-950 text-white"
                : "text-marine-600 hover:bg-white hover:text-marine-950",
            )}
          >
            <item.Icon className="size-4" />
          </button>
        ))}
      </div>

      <div className="relative">
        {empty && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-4 left-4 text-[0.95rem] text-marine-400"
          >
            {placeholder}
          </span>
        )}

        <div
          id={id ?? fallbackId}
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          onInput={sync}
          onBlur={sync}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
          // `prose-guide` porte la typographie du contenu : elle est définie une
          // fois dans globals.css et sert aussi à l'affichage public, pour que le
          // praticien voie exactement ce que le lecteur verra.
          className="prose-guide min-h-56 max-w-none overflow-y-auto p-4 text-[0.95rem] text-marine-950 focus:outline-none"
        />
      </div>
    </div>
  );
}

/**
 * Demande une adresse de lien et la valide.
 *
 * `prompt` plutôt qu'une boîte de dialogue maison : la sélection courante doit
 * survivre à la saisie, et tout composant React monté entre-temps la ferait
 * perdre. C'est le seul endroit de l'interface où ce compromis se justifie.
 */
function askForUrl(): string | null {
  const url = window.prompt("Adresse du lien", "https://");

  if (!url) return null;

  // Un lien « javascript: » posé dans un guide s'exécuterait chez le lecteur.
  // wp_kses_post le retirerait à l'enregistrement, mais l'auteur croirait
  // jusque-là avoir posé un lien valide.
  if (!/^https?:\/\//i.test(url)) {
    window.alert("Seules les adresses commençant par http:// ou https:// sont acceptées.");
    return null;
  }

  return url;
}
