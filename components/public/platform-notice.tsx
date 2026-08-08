import { IconShieldCheck } from "@/components/ui/icons";

/**
 * Rappel du rôle exact de la plateforme.
 *
 * La mention existait déjà — en pied de page, en gris clair, sous le
 * copyright. Juridiquement suffisante, pratiquement invisible : personne ne
 * fait défiler jusqu'en bas avant de cliquer sur « Poser mon problème ».
 *
 * Or c'est précisément au moment de confier une situation personnelle qu'il
 * faut avoir compris à qui l'on s'adresse. Sur un site traitant de droit —
 * catégorie que Google range en « votre argent ou votre vie » et évalue en
 * conséquence — l'ambiguïté sur la nature du service est le premier défaut de
 * confiance relevé.
 *
 * D'où ce rappel, court et posé là où la décision se prend, plutôt qu'un
 * paragraphe que personne ne lira.
 */
export function PlatformNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-start gap-2.5 rounded-2xl bg-marine-950/4 px-4 py-3 text-[0.8rem]/relaxed text-marine-700 ring-1 ring-marine-950/8 ring-inset ${className}`}
    >
      <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
      <span>
        TakeALawyer met en relation, <strong className="font-semibold">sans jamais conseiller</strong>.
        Seuls les avocats inscrits au Barreau, dont nous vérifions la carte
        professionnelle avant publication, sont habilités à vous répondre.
      </span>
    </p>
  );
}
