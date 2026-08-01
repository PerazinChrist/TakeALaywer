import { Fragment } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { IconArrowRight, IconScale } from "@/components/ui/icons";

/**
 * En-tête repris de la page d'accueil, en version adoucie.
 *
 * On garde ce qui fait l'identité du bandeau — fond `bg-panel`, pastille or du
 * logo, liens séparés par des puces rondes — et on retire ce qui le sature :
 * pastilles de réseaux sociaux et panneau hamburger. Sur mobile, il ne reste
 * que le logo et l'accès avocat ; la navigation est assurée par la barre
 * d'action en bas d'écran et par le pied de page.
 */
const navLinks = [
  { href: "/accueil-epure", label: "Accueil" },
  { href: "/avocats", label: "Avocats" },
  { href: "/guides", label: "Guides" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
];

export function SiteHeaderEpure() {
  return (
    <header className="sticky top-0 z-50 border-b border-marine-950/6 bg-panel/85 backdrop-blur-md">
      <div className="container-page flex h-20 items-center justify-between gap-4 lg:gap-12">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="TakeALawyer, retour à l’accueil"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-gold-400 to-gold-600 text-white shadow-gold">
            <IconScale className="size-5.5" strokeWidth={2} />
          </span>
          {/* Sous 360 px, la pastille seule tient lieu de logo : le mot-symbole
              et le bouton d'action ne rentrent pas ensemble. */}
          <span className="font-serif text-xl font-bold tracking-tight text-marine-950 max-[360px]:hidden">
            Take<span className="text-gold-500">A</span>Lawyer
          </span>
        </Link>

        {/* Puces plus discrètes que sur l'en-tête complet : marine à 30 %. */}
        <nav
          className="hidden items-center lg:flex"
          aria-label="Navigation principale"
        >
          {navLinks.map((link, i) => (
            <Fragment key={link.href}>
              {i > 0 && (
                <span
                  className="mx-5 size-[5px] shrink-0 rounded-full bg-marine-950/30"
                  aria-hidden="true"
                />
              )}
              <Link
                href={link.href}
                className="text-[0.95rem] font-medium whitespace-nowrap text-marine-800 transition-colors hover:text-gold-600"
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
        </nav>

        <Link
          href="/avocats/inscription"
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            className: "border-marine-950/12 bg-white/70",
          })}
        >
          Espace Avocat
          <IconArrowRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 sm:block" />
        </Link>
      </div>
    </header>
  );
}
