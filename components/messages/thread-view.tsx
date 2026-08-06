"use client";

import { useEffect, useRef, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { TextArea } from "@/components/ui/form";
import { postJson } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ConversationMessage } from "@/lib/api/types";
import { IconAlert, IconSend } from "@/components/ui/icons";

/**
 * Le fil d'une conversation, et de quoi y répondre.
 *
 * L'état des messages est tenu ici plutôt que rechargé du serveur à chaque
 * envoi : un fil se lit de haut en bas, et un rafraîchissement complet le
 * ferait sauter à chaque message. Le message envoyé est ajouté avec la version
 * que le serveur vient de confirmer — jamais avec celle qu'on croit avoir
 * envoyée.
 */
export function ThreadView({
  uuid,
  viewer,
  initial,
  peerName,
}: {
  uuid: string;
  /** Versant du lecteur, tel que le résout `lib/api/desk`. */
  viewer: "client" | "account";
  initial: ConversationMessage[];
  peerName: string;
}) {
  const [messages, setMessages] = useState(initial);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const bottom = useRef<HTMLDivElement>(null);

  // Le fil s'ouvre sur son dernier message : c'est celui qu'on vient lire.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();

    const text = body.trim();

    if (text === "" || pending) return;

    setPending(true);
    setError("");

    const result = await postJson<{ message: ConversationMessage }>(
      `/api/messages/${encodeURIComponent(uuid)}`,
      { body: text, viewer: viewer === "account" ? "avocat" : "citoyen" },
    );

    setPending(false);

    if (!result.ok || !result.data) {
      setError(result.message);
      return;
    }

    setMessages((current) => [...current, result.data!.message]);
    setBody("");
  }

  return (
    <div className="flex flex-col">
      <ol className="space-y-4">
        {messages.map((message) => (
          <li key={message.id} className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]",
                message.mine
                  ? "bg-marine-950 text-white"
                  : "bg-marine-50 text-marine-900 ring-1 ring-marine-950/6 ring-inset",
              )}
            >
              {!message.mine && (
                <p className="mb-1 text-xs font-semibold text-marine-500">{message.author}</p>
              )}

              <p className="text-[0.95rem]/relaxed whitespace-pre-line">{message.body}</p>

              <p
                className={cn(
                  "mt-1.5 text-[0.7rem]",
                  message.mine ? "text-marine-300" : "text-marine-400",
                )}
              >
                {message.date}
              </p>
            </div>
          </li>
        ))}

        <div ref={bottom} />
      </ol>

      {messages.length === 0 && (
        <p className="rounded-2xl border border-dashed border-marine-300 px-6 py-10 text-center text-sm/relaxed text-marine-600">
          Ce fil est vide. Écrivez le premier message.
        </p>
      )}

      <form onSubmit={send} className="mt-6 border-t border-marine-950/8 pt-5">
        <TextArea
          aria-label={`Votre message à ${peerName}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Écrire à ${peerName}…`}
          className="min-h-28"
          onKeyDown={(event) => {
            // Ctrl+Entrée envoie : la touche Entrée seule doit rester un retour
            // à la ligne, un message de conversation en contient souvent.
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700"
          >
            <IconAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending || body.trim() === ""}
            className={buttonStyles({ size: "md" })}
          >
            <IconSend className="size-4" />
            {pending ? "Envoi…" : "Envoyer"}
          </button>

          <p className="text-xs text-marine-500">Ctrl + Entrée pour envoyer.</p>
        </div>
      </form>
    </div>
  );
}
