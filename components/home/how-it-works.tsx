import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { howItWorksSteps } from "@/lib/data/home";
import {
  IconArrowRight,
  IconMessage,
  IconSend,
  IconShieldCheck,
} from "@/components/ui/icons";

const icons = {
  send: IconSend,
  message: IconMessage,
  shield: IconShieldCheck,
} as const;

/** Comment ça marche — 3 étapes simples (project-modules.md § Landing Page). */
export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-panel py-20 lg:py-28"
      aria-labelledby="etapes-titre"
    >
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Comment ça marche"
          title={<span id="etapes-titre">Trois étapes, aucune mauvaise surprise</span>}
          description="De la question posée anonymement à la consultation, le parcours est balisé — et vous gardez la main à chaque étape."
        />

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {/* Fil conducteur entre les étapes (desktop) */}
          <div
            className="absolute top-14 right-[16.6%] left-[16.6%] hidden h-px bg-linear-to-r from-gold-300/0 via-gold-400 to-gold-300/0 lg:block"
            aria-hidden="true"
          />

          {howItWorksSteps.map((step) => {
            const Icon = icons[step.icon];
            return (
              <li
                key={step.step}
                className="relative flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-marine-950/5"
              >
                <span className="relative grid size-16 place-items-center rounded-2xl bg-linear-to-br from-marine-800 to-marine-950 text-gold-300 shadow-marine">
                  <Icon className="size-7" />
                  <span className="absolute -top-2.5 -right-2.5 grid size-8 place-items-center rounded-full bg-gold-500 font-serif text-sm font-bold text-white ring-4 ring-white">
                    {step.step.replace("0", "")}
                  </span>
                </span>

                <span className="mt-6 inline-flex rounded-full bg-trust-500/8 px-3 py-1 text-xs font-semibold text-trust-600">
                  {step.highlight}
                </span>

                <h3 className="mt-4 font-serif text-xl/snug font-bold text-marine-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link href="/besoin/nouveau" className={buttonStyles({ size: "lg" })}>
            Poser mon besoin maintenant
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
