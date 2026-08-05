"use client";

import { useEffect, useState } from "react";
import {
  IconClose,
  IconCrown,
  IconMessage,
  IconSend,
  IconStar,
} from "@/components/ui/icons";

const tones = {
  need: { Icon: IconSend, className: "bg-gold-500/12 text-gold-600" },
  consult: { Icon: IconMessage, className: "bg-marine-100 text-marine-700" },
  purchase: { Icon: IconCrown, className: "bg-gold-500/12 text-gold-600" },
  review: { Icon: IconStar, className: "bg-trust-500/12 text-trust-600" },
} as const;

/** Un événement d'activité, construit côté serveur à partir de la base. */
export type SocialProofEvent = {
  id: string;
  message: string;
  detail: string;
  tone: keyof typeof tones;
};

/**
 * Widgets de preuve sociale « en direct » — directive-ui.md § 3.
 *
 * Discret, en bas à gauche, et refermable : la réassurance ne doit jamais gêner
 * la lecture. Les événements sont fournis par le rendu serveur et décrivent des
 * faits réels — un avis publié, un guide en tête de la bibliothèque — plutôt
 * que des messages inventés qui se répéteraient à l'identique d'une visite à
 * l'autre.
 */
export function SocialProofToaster({ events }: { events: SocialProofEvent[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const total = events.length;

  useEffect(() => {
    if (dismissed || total === 0) return;

    let timer: ReturnType<typeof setTimeout>;

    const show = () => {
      setVisible(true);
      timer = setTimeout(hide, 6500);
    };

    const hide = () => {
      setVisible(false);
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % total);
        show();
      }, 5000);
    };

    timer = setTimeout(show, 4000);
    return () => clearTimeout(timer);
  }, [dismissed, total]);

  if (dismissed || !visible || total === 0) return null;

  const event = events[index % total];
  const { Icon, className } = tones[event.tone];

  return (
    <div
      className="animate-slide-in-left fixed bottom-6 left-6 z-40 hidden max-w-xs sm:block"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-start gap-3 rounded-2xl border border-marine-950/8 bg-white/95 p-4 pr-10 shadow-card backdrop-blur-md">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${className}`}>
          <Icon className="size-4" />
        </span>

        <div>
          <p className="text-sm/snug font-medium text-marine-900">{event.message}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-marine-500">
            <span className="size-1.5 rounded-full bg-trust-500" aria-hidden="true" />
            {event.detail}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Masquer les notifications d’activité"
          className="absolute top-3 right-3 grid size-6 place-items-center rounded-full text-marine-400 transition-colors hover:bg-marine-50 hover:text-marine-700"
        >
          <IconClose className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
