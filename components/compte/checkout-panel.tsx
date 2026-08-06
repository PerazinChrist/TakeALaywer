"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { postJson } from "@/lib/api/client";
import { cn, formatFcfa } from "@/lib/utils";
import type { CheckoutOrder, UnlockResult } from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconLock,
  IconShieldCheck,
  IconSmartphone,
} from "@/components/ui/icons";

/**
 * Choix du moyen de paiement, puis confirmation.
 *
 * ⚠️ **Point de branchement du prestataire.** Aujourd'hui, `confirm()` appelle
 * directement le déblocage : le plugin enregistre l'achat, en le marquant
 * « simulé » tant qu'aucun opérateur n'encaisse (voir
 * TAL_REST_Client::simulated_payments). C'est ce que la bannière annonce en
 * toutes lettres — un tunnel qui ferait semblant d'encaisser sans le dire
 * serait un mensonge, y compris en développement.
 *
 * Le jour où un opérateur est branché, seule cette fonction change : elle
 * appellera l'initiation de paiement avec `method`, redirigera vers l'écran de
 * l'opérateur, et c'est son rappel serveur qui confirmera l'achat. Le reste de
 * la page — récapitulatif, choix, états d'attente — est déjà à sa place, et le
 * backend distingue déjà « en attente » de « payé ».
 */
export function CheckoutPanel({ order }: { order: CheckoutOrder }) {
  const router = useRouter();

  const available = order.methods.filter((method) => method.enabled);

  const [method, setMethod] = useState(available[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(order.pending);

  const confirm = async () => {
    setPending(true);
    setError("");

    const result = await postJson<UnlockResult>(
      `/api/compte/guides/${encodeURIComponent(order.guide.slug)}/deblocage`,
      { method },
    );

    if (!result.ok || !result.data) {
      setPending(false);
      setError(result.message);
      return;
    }

    if (!result.data.unlocked) {
      // Paiement engagé mais pas confirmé : le guide reste fermé, et le message
      // du serveur explique pourquoi mieux qu'une phrase écrite ici.
      setPending(false);
      setWaiting(true);
      setError(result.data.message);
      return;
    }

    // `pending` reste vrai : la navigation va remplacer cette page, et
    // réactiver le bouton laisserait un second achat possible entre-temps.
    router.push(`/guides/${order.guide.slug}`);
    router.refresh();
  };

  if (order.owned) {
    return (
      <Done
        slug={order.guide.slug}
        title="Ce guide est déjà à vous"
        body="Il est dans votre bibliothèque, en accès permanent. Aucun nouveau paiement n’est nécessaire."
      />
    );
  }

  if (order.free) {
    return (
      <div className="space-y-5">
        <p className="flex items-start gap-2.5 rounded-xl bg-trust-500/8 p-4 text-sm/relaxed text-marine-700">
          <IconShieldCheck className="mt-0.5 size-4.5 shrink-0 text-trust-600" />
          Ce guide est en lecture libre. L’ajouter à votre bibliothèque le rend
          accessible depuis votre espace, même s’il est retiré du catalogue plus
          tard.
        </p>

        {error && <ErrorNote message={error} />}

        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className={buttonStyles({ size: "lg", full: true })}
        >
          {pending ? "Ajout…" : "Ajouter à ma bibliothèque"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {order.simulated && (
        <p className="flex items-start gap-2.5 rounded-xl bg-gold-50 p-4 text-sm/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <IconAlert className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          <span>
            <span className="font-semibold">Paiement simulé.</span> Aucun
            opérateur n’est branché sur cette installation : la confirmation
            enregistre l’achat sans qu’aucun franc ne soit encaissé.
          </span>
        </p>
      )}

      {waiting && (
        <p className="flex items-start gap-2.5 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
          <IconClock className="mt-0.5 size-4.5 shrink-0 text-marine-400" />
          <span>
            Un paiement est déjà engagé pour ce guide
            {order.reference && (
              <>
                {" "}
                (référence <span className="font-mono text-xs">{order.reference}</span>)
              </>
            )}
            . Le guide s’ouvrira dès qu’il sera confirmé.
          </span>
        </p>
      )}

      <fieldset>
        <legend className="font-serif text-lg font-bold text-marine-950">
          Moyen de paiement
        </legend>

        <div className="mt-4 space-y-2.5">
          {order.methods.map((entry) => {
            const selected = entry.id === method;

            return (
              <button
                key={entry.id}
                type="button"
                disabled={!entry.enabled}
                onClick={() => setMethod(entry.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                  !entry.enabled && "cursor-not-allowed opacity-55",
                  selected
                    ? "border-gold-500 bg-gold-50/60"
                    : "border-marine-950/10 bg-white hover:border-marine-950/25",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    selected ? "border-gold-600 bg-gold-500 text-marine-950" : "border-marine-950/20",
                  )}
                >
                  {selected && <IconCheck className="size-3" strokeWidth={3} />}
                </span>

                <span className="min-w-0">
                  <span className="block font-semibold text-marine-950">
                    {entry.label}
                    {!entry.enabled && (
                      <span className="ml-2 text-xs font-normal text-marine-500">
                        bientôt disponible
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm/relaxed text-marine-600">
                    {entry.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {available.length === 0 && (
          <p className="mt-3 text-sm/relaxed text-marine-600">
            Aucun moyen de paiement n’est actif pour l’instant. Revenez d’ici
            quelques jours.
          </p>
        )}
      </fieldset>

      {error && <ErrorNote message={error} />}

      <div className="border-t border-marine-950/8 pt-5">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-marine-600">Total à régler</span>
          <span className="font-serif text-2xl font-bold text-marine-950">
            {formatFcfa(order.amount)}
          </span>
        </p>

        <button
          type="button"
          onClick={confirm}
          disabled={pending || method === ""}
          className={buttonStyles({ size: "lg", full: true, className: "mt-4" })}
        >
          <IconSmartphone className="size-4.5" />
          {pending ? "Traitement…" : `Payer ${formatFcfa(order.amount)}`}
        </button>

        <p className="mt-3 flex items-start gap-2 text-xs/relaxed text-marine-500">
          <IconLock className="mt-0.5 size-3.5 shrink-0" />
          Paiement unique, accès permanent. Aucune donnée bancaire n’est
          conservée sur nos serveurs.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm/relaxed text-danger-700"
    >
      <IconAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

function Done({ slug, title, body }: { slug: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-trust-500/25 bg-trust-500/8 p-6 text-center">
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-trust-600"
        aria-hidden="true"
      >
        <IconCheck className="size-6" />
      </span>

      <p className="mt-4 font-serif text-lg font-bold text-marine-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm/relaxed text-marine-600">{body}</p>

      <Link href={`/guides/${slug}`} className={buttonStyles({ size: "sm", className: "mt-6" })}>
        Lire le guide
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
}
