import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { reassurancePoints, simpleSteps } from "@/lib/data/home";
import {
  IconArrowRight,
  IconCheck,
  IconLock,
  IconScale,
  IconSend,
  IconSmartphone,
  IconUsers,
} from "@/components/ui/icons";

const stepIcons = {
  send: IconSend,
  users: IconUsers,
  check: IconCheck,
} as const;

const reassuranceIcons = {
  lock: IconLock,
  scale: IconScale,
  phone: IconSmartphone,
} as const;

/**
 * ÉCRAN 4 — la réassurance.
 *
 * Trois étapes sur fond blanc, puis les trois garanties qui lèvent les
 * dernières objections : anonymat, qualification des avocats, paiement mobile.
 */
export function HowItWorksEpure() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-white py-20 lg:py-28"
      aria-labelledby="etapes-titre"
    >
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Comment ça marche"
          title={<span id="etapes-titre">Trois étapes simples</span>}
          description="Posez votre problème, choisissez votre avocat, réglez votre situation. Vous gardez la main du début à la fin."
        />

        <ol className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {simpleSteps.map((step, index) => {
            const Icon = stepIcons[step.icon];
            const last = index === simpleSteps.length - 1;

            return (
              <li
                key={step.step}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative grid size-20 place-items-center rounded-3xl bg-linear-to-br from-marine-800 to-marine-950 text-gold-300 shadow-marine">
                  <Icon className="size-8" />
                  <span className="absolute -top-2.5 -right-2.5 grid size-8 place-items-center rounded-full bg-gold-500 font-serif text-sm font-bold text-marine-950 ring-4 ring-white">
                    {step.step}
                  </span>
                </span>

                <h3 className="mt-7 font-serif text-2xl font-bold text-marine-950">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-[0.95rem]/relaxed text-marine-600">
                  {step.description}
                </p>

                {/* Liaison visuelle entre les étapes (desktop uniquement). */}
                {!last && (
                  <IconArrowRight
                    className="absolute top-8 -right-4 hidden size-6 text-gold-400 lg:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Les trois garanties, en bandeau sobre. */}
        <ul className="mt-20 grid gap-8 rounded-3xl bg-panel p-8 sm:grid-cols-3 lg:p-10">
          {reassurancePoints.map((point) => {
            const Icon = reassuranceIcons[point.icon];

            return (
              <li key={point.title} className="flex flex-col items-center text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-gold-500/12 text-gold-700 ring-1 ring-gold-500/25 ring-inset">
                  <Icon className="size-6" />
                </span>
                <p className="mt-4 font-semibold text-marine-950">{point.title}</p>
                <p className="mt-1.5 text-sm/relaxed text-marine-600">
                  {point.description}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex flex-col items-center gap-4">
          <Link href="/besoin/nouveau" className={buttonStyles({ size: "lg" })}>
            Poser mon problème gratuitement
            <IconArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-sm text-marine-500">
            Gratuit, anonyme et sans engagement — aucune carte bancaire demandée.
          </p>
        </div>
      </div>
    </section>
  );
}
