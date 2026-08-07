"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { postJson } from "@/lib/api/client";
import {
  clearPendingPayment,
  parsePendingPayment,
  readPendingPayment,
  readPendingPaymentOnServer,
  savePendingPayment,
  subscribePendingPayment,
} from "@/lib/paiement/paiement-en-cours";
import { cn, formatFcfa } from "@/lib/utils";
import type { CheckoutOrder, CollectStart, PaymentStatusResult, UnlockResult } from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconLock,
  IconPhone,
  IconShieldCheck,
  IconSmartphone,
} from "@/components/ui/icons";

/**
 * Choix du moyen de paiement, puis encaissement Mobile Money via CamPay.
 *
 * Le tunnel se joue en deux temps, parce que le Mobile Money est asynchrone :
 * personne ne paie dans le navigateur, on paie sur son téléphone.
 *
 *   1. `demarrer()` appelle /api/paiements/campay/collecte. CamPay envoie une
 *      demande de validation sur le téléphone du citoyen et nous rend une
 *      référence. Rien n'est encaissé à cet instant.
 *   2. La vue d'attente interroge /api/paiements/campay/statut jusqu'à ce que
 *      l'opérateur tranche. C'est cette route — et elle seule — qui ouvre le
 *      guide, après avoir vérifié la transaction auprès de CamPay.
 *
 * Le navigateur ne décide donc jamais qu'un paiement a réussi : il ne fait que
 * poser la question. Un `unlocked: true` fabriqué dans la console n'ouvrirait
 * rien, puisque l'écriture a déjà eu lieu — ou non — côté serveur.
 *
 * Quand aucun identifiant CamPay n'est configuré (`campayReady` à faux), on
 * retombe sur le déblocage direct que le plugin marque « simulé », avec la
 * bannière qui le dit en toutes lettres. Un tunnel qui ferait semblant
 * d'encaisser sans le dire serait un mensonge, y compris en développement.
 */
export function CheckoutPanel({
  order,
  campayReady,
}: {
  order: CheckoutOrder;
  /** Vrai quand les clés CamPay sont renseignées côté serveur. */
  campayReady: boolean;
}) {
  const router = useRouter();

  const available = order.methods.filter((method) => method.enabled);

  const [method, setMethod] = useState(available[0]?.id ?? "");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [waiting, setWaiting] = useState(order.pending);

  // Encaissement réel seulement si les clés existent *et* que le guide est
  // payant : un guide gratuit n'a rien à demander à un opérateur.
  const live = campayReady && !order.free;

  const slug = order.guide.slug;

  /* ------------------------------------------------------------------ */
  /* Transaction en cours — reprise après fermeture de l'onglet           */
  /* ------------------------------------------------------------------ */

  // La transaction engagée vit dans `sessionStorage`, pas dans un `useState` :
  // le citoyen valide sur son téléphone et peut quitter la page entre-temps.
  // Lu via `useSyncExternalStore` parce que c'est bien un système extérieur à
  // React — et parce que l'instantané serveur explicite (null) évite toute
  // divergence d'hydratation.
  const savedRaw = useSyncExternalStore(
    subscribePendingPayment,
    useCallback(() => (live ? readPendingPayment(slug) : null), [live, slug]),
    readPendingPaymentOnServer,
  );

  const started = useMemo(() => parsePendingPayment(savedRaw), [savedRaw]);

  /* ------------------------------------------------------------------ */
  /* Déblocage direct — guides gratuits et installations sans opérateur   */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /* Encaissement Mobile Money                                           */
  /* ------------------------------------------------------------------ */

  const demarrer = async () => {
    setPending(true);
    setError("");
    setFieldError("");

    const result = await postJson<CollectStart>("/api/paiements/campay/collecte", {
      slug,
      phone,
      method,
    });

    setPending(false);

    if (!result.ok || !result.data) {
      // Un numéro rejeté se signale sous le champ concerné ; le reste — panne
      // réseau, opérateur indisponible — au-dessus du bouton.
      if (result.errors.phone) setFieldError(String(result.errors.phone));
      else setError(result.message);
      return;
    }

    // L'écriture notifie le store : c'est elle qui fait basculer l'affichage
    // vers la vue d'attente, sans état local à tenir en parallèle.
    savePendingPayment(slug, result.data);
  };

  // Ces deux rappels sont passés à `AwaitingPayment`, qui les appelle depuis sa
  // boucle d'interrogation. Mémoïsés pour que cette boucle ne redémarre pas à
  // chaque rendu du parent — sans quoi chaque battement d'état relancerait le
  // compteur des trois minutes.
  const done = useCallback(() => {
    clearPendingPayment(slug);
    router.push(`/guides/${slug}`);
    router.refresh();
  }, [router, slug]);

  const abandon = useCallback(
    (message: string) => {
      clearPendingPayment(slug);
      setError(message);
    },
    [slug],
  );

  // Encaissé, mais le guide n'est pas ouvert pour autant.
  //
  // Le plugin ne bascule un achat en « payé » que lorsqu'il simule les
  // paiements ; hors simulation, il ouvre une ligne « en attente » et compte
  // sur une confirmation qu'aucune route REST n'expose encore. Naviguer vers le
  // guide comme si de rien n'était afficherait un paywall à quelqu'un qui vient
  // de payer — on le dit, et on donne la référence.
  const [settled, setSettled] = useState<PaymentStatusResult | null>(null);

  const settle = useCallback(
    (result: PaymentStatusResult) => {
      clearPendingPayment(slug);
      setSettled(result);
    },
    [slug],
  );

  /* ------------------------------------------------------------------ */
  /* Rendu                                                               */
  /* ------------------------------------------------------------------ */

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

  if (settled) {
    return (
      <Done
        slug={order.guide.slug}
        title="Paiement reçu"
        body={
          `${settled.message} ` +
          (settled.reference
            ? `Conservez la référence ${settled.reference} : elle suffit à faire ouvrir l’accès si l’attente se prolonge.`
            : "")
        }
      />
    );
  }

  if (started) {
    return (
      <AwaitingPayment
        order={order}
        started={started}
        method={method}
        onSuccess={done}
        onSettled={settle}
        onAbandon={abandon}
      />
    );
  }

  return (
    <div className="space-y-6">
      {!campayReady && order.simulated && (
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

      {live && (
        <Field
          label="Numéro Mobile Money"
          htmlFor="paiement-telephone"
          hint="Celui qui sera débité. La demande de validation y arrivera dans les secondes qui suivent."
          error={fieldError}
          required
        >
          <div className="relative">
            <IconPhone
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-marine-400"
              aria-hidden="true"
            />
            <TextInput
              id="paiement-telephone"
              name="telephone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="6 99 00 00 00"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              invalid={Boolean(fieldError)}
              className="pl-11"
            />
          </div>
        </Field>
      )}

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
          onClick={live ? demarrer : confirm}
          disabled={pending || method === "" || (live && phone.trim() === "")}
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
/* Attente de la validation sur le téléphone                                  */
/* -------------------------------------------------------------------------- */

/** Intervalle entre deux interrogations du statut. */
const POLL_MS = 4000;

/**
 * Nombre d'interrogations avant de rendre la main.
 *
 * Trois minutes : au-delà, l'invitation affichée sur le téléphone a
 * généralement expiré côté opérateur. Continuer indéfiniment donnerait
 * l'illusion d'un paiement en cours alors qu'il n'y a plus rien à attendre.
 */
const POLL_MAX = 45;

function AwaitingPayment({
  order,
  started,
  method,
  onSuccess,
  onSettled,
  onAbandon,
}: {
  order: CheckoutOrder;
  started: CollectStart;
  method: string;
  /** Encaissé *et* guide ouvert. Mémoïsé : la boucle ne doit pas redémarrer. */
  onSuccess: () => void;
  /** Encaissé, mais l'ouverture reste à confirmer côté backend. */
  onSettled: (result: PaymentStatusResult) => void;
  /** Idem — voir `done`, `settle` et `abandon` dans `CheckoutPanel`. */
  onAbandon: (message: string) => void;
}) {
  const [note, setNote] = useState(
    "Une demande de validation vient d’être envoyée sur votre téléphone.",
  );
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(false);

  const ask = useCallback(async () => {
    return postJson<PaymentStatusResult>("/api/paiements/campay/statut", {
      slug: order.guide.slug,
      reference: started.reference,
      method,
    });
  }, [order.guide.slug, started.reference, method]);

  useEffect(() => {
    let alive = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const result = await ask();

      if (!alive) return;

      if (result.ok && result.data) {
        if (result.data.status === "SUCCESSFUL") {
          // `unlocked` n'est pas décoratif : l'argent peut être encaissé sans
          // que le guide soit ouvert. Confondre les deux enverrait l'acheteur
          // droit sur un paywall.
          if (result.data.unlocked) onSuccess();
          else onSettled(result.data);
          return;
        }

        if (result.data.status === "FAILED") {
          onAbandon(result.data.message);
          return;
        }

        setNote(result.data.message);
      } else if (result.status === 409 || result.status === 401) {
        // Conflit de commande ou session expirée : réessayer ne changera rien,
        // et le message du serveur dit quoi faire.
        onAbandon(result.message);
        return;
      }
      // Les autres échecs — réseau coupé, CamPay momentanément indisponible —
      // ne concluent rien : le paiement suit son cours sur le téléphone, on
      // reposera la question au prochain tour.

      attempts += 1;

      if (attempts >= POLL_MAX) {
        setExpired(true);
        return;
      }

      // Enchaînement par setTimeout plutôt que setInterval : deux
      // interrogations ne peuvent jamais se chevaucher si le réseau traîne.
      timer = setTimeout(tick, POLL_MS);
    };

    timer = setTimeout(tick, POLL_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [ask, onSuccess, onSettled, onAbandon]);

  /** Reprise manuelle après expiration de la boucle automatique. */
  const recheck = async () => {
    setChecking(true);

    const result = await ask();

    setChecking(false);

    if (!result.ok || !result.data) {
      setNote(result.message);
      return;
    }

    if (result.data.status === "SUCCESSFUL") {
      return result.data.unlocked ? onSuccess() : onSettled(result.data);
    }

    if (result.data.status === "FAILED") return onAbandon(result.data.message);

    setNote(result.data.message);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-gold-500/40 bg-gold-50/50 p-6 text-center">
        <span
          className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-gold-700"
          aria-hidden="true"
        >
          <IconSmartphone className="size-6" />
        </span>

        <p className="mt-4 font-serif text-lg font-bold text-marine-950">
          Validez sur votre téléphone
        </p>

        <p className="mx-auto mt-2 max-w-sm text-sm/relaxed text-marine-700" aria-live="polite">
          {note} Saisissez votre code secret {started.operator ? labelOperator(started.operator) : "Mobile Money"} pour
          confirmer le débit de {formatFcfa(order.amount)}.
        </p>

        {started.ussdCode && (
          <p className="mx-auto mt-4 max-w-sm rounded-xl bg-white/80 p-3.5 text-xs/relaxed text-marine-600">
            Rien ne s’affiche ? Composez{" "}
            <span className="font-mono font-semibold text-marine-950">{started.ussdCode}</span>{" "}
            pour retrouver la demande en attente.
          </p>
        )}

        {!expired && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-marine-500">
            <span
              className="size-1.5 animate-pulse rounded-full bg-gold-600"
              aria-hidden="true"
            />
            Vérification automatique en cours…
          </p>
        )}
      </div>

      <dl className="space-y-2 rounded-2xl bg-marine-50 p-5 text-sm">
        <Line label="Guide" value={order.guide.title} />
        <Line label="Numéro débité" value={formatPhone(started.phone)} />
        <Line label="Montant" value={formatFcfa(order.amount)} />
        <Line label="Référence" value={started.reference} mono />
      </dl>

      {expired && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 rounded-xl bg-marine-50 p-3.5 text-sm/relaxed text-marine-700">
            <IconClock className="mt-0.5 size-4 shrink-0 text-marine-400" />
            La vérification automatique s’est arrêtée après trois minutes. Si
            vous venez de valider, relancez-la — rien n’est perdu.
          </p>

          <button
            type="button"
            onClick={recheck}
            disabled={checking}
            className={buttonStyles({ variant: "outline", size: "md", full: true })}
          >
            {checking ? "Vérification…" : "Vérifier à nouveau"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => onAbandon("")}
        className="w-full text-center text-sm font-semibold text-marine-500 underline-offset-4 hover:text-marine-800 hover:underline"
      >
        Reprendre avec un autre numéro
      </button>

      <p className="flex items-start gap-2 text-xs/relaxed text-marine-500">
        <IconShieldCheck className="mt-0.5 size-3.5 shrink-0 text-trust-600" />
        Votre code secret ne transite jamais par ce site : il est saisi sur votre
        téléphone, auprès de votre opérateur.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-marine-500">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right font-semibold text-marine-950",
          mono && "font-mono text-xs font-normal",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** « mtn » → « MTN Mobile Money ». CamPay renvoie l'opérateur en minuscules. */
function labelOperator(operator: string) {
  const key = operator.trim().toLowerCase();

  if (key === "mtn") return "MTN Mobile Money";
  if (key === "orange") return "Orange Money";

  return operator;
}

/** 237699000000 → « +237 6 99 00 00 00 », plus lisible pour une relecture. */
function formatPhone(phone: string) {
  const match = /^237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(phone);

  if (!match) return phone;

  return `+237 ${match.slice(1).join(" ")}`;
}

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
