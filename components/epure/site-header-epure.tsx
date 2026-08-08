import { Fragment } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MobileNav, type NavLink } from "@/components/layout/mobile-nav";
import { fetchCurrentAccount } from "@/lib/api/account";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { IconArrowRight, IconScale, IconUser } from "@/components/ui/icons";

/**
 * En-tête de toutes les pages publiques.
 *
 * Bandeau clair, pastille or du logo, liens séparés par des puces rondes.
 *
 * Au-delà de `lg`, les liens sont dans la barre. En dessous, ils passent dans
 * le panneau de `MobileNav` : la barre ne garde que le logo, la cloche et le
 * bouton menu. Loger en plus l'appel à l'action « Espace Avocat » sur 360 px
 * poussait le mot-symbole hors de l'écran — il est repris dans le panneau, où
 * il a la place d'être lisible.
 */
const navLinks: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/avocats", label: "Avocats" },
  { href: "/guides", label: "Guides" },
  { href: "/communaute", label: "Communauté" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
];

export async function SiteHeaderEpure() {
  /*
   * Composant serveur : les sessions sont lues directement, sans état client ni
   * scintillement au chargement. Le bouton d'action mène à l'inscription pour
   * un visiteur, à son espace pour un praticien connecté — proposer « Espace
   * Avocat » à quelqu'un qui a déjà un compte, et l'envoyer sur un formulaire
   * d'inscription, n'a pas de sens.
   *
   * Les deux sessions sont indépendantes : un citoyen connecté voit sa pastille
   * même si aucun avocat ne l'est, et réciproquement. Les deux lectures sont
   * mémoïsées, et aucune requête ne part si le cookie correspondant est absent.
   */
  const [session, client] = await Promise.all([fetchCurrentAccount(), fetchCurrentClient()]);

  const signedIn = session !== null || client !== null;

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

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* La cloche ne se rend d'elle-même que pour un visiteur connecté :
              inutile de la conditionner ici aussi. */}
          <NotificationBell />

          {signedIn ? (
            /*
             * Connecté, quel que soit le versant : un seul accès, le sien.
             * « Se connecter » ne doit jamais cohabiter avec « Mon espace » —
             * la première invite à faire ce que la seconde prouve déjà fait.
             *
             * Le compte citoyen passe devant quand les deux sessions sont
             * ouvertes : c'est celui qui se reconnaît d'un coup d'œil, à sa
             * pastille. L'espace praticien reste atteignable juste à côté.
             */
            <>
              {client && (
                <Link
                  href="/compte"
                  className="flex items-center gap-2 rounded-full bg-white/70 py-1 pr-3.5 pl-1 ring-1 ring-marine-950/12 transition-colors hover:ring-gold-500/40 max-lg:hidden"
                  aria-label={`Mon espace — ${client.client.pseudonym}`}
                >
                  <Avatar initials={initialsOf(client.client.pseudonym)} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-semibold text-marine-900 sm:block">
                    {client.client.pseudonym}
                  </span>
                </Link>
              )}

              {session && (
                <Link
                  href="/avocats/espace-praticien"
                  className={buttonStyles({
                    variant: "outline",
                    size: "sm",
                    className: "border-marine-950/12 bg-white/70 max-lg:hidden",
                  })}
                >
                  {/* « Espace praticien » plutôt que « Mon espace » lorsque la
                      pastille citoyenne est là aussi : deux boutons nommés
                      pareil ne se distingueraient plus. */}
                  {client ? "Espace praticien" : "Mon espace"}
                  <IconArrowRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 sm:block" />
                </Link>
              )}
            </>
          ) : (
            /* Visiteur anonyme : la connexion citoyenne en lien discret, et
               l'appel à l'action réservé au recrutement des praticiens. */
            <>
              <Link
                href="/compte/connexion"
                className="hidden items-center gap-1.5 text-[0.95rem] font-medium text-marine-800 transition-colors hover:text-gold-600 lg:flex"
              >
                <IconUser className="size-4" />
                Se connecter
              </Link>

              <Link
                href="/avocats/inscription"
                className={buttonStyles({
                  variant: "outline",
                  size: "sm",
                  className: "border-marine-950/12 bg-white/70 max-lg:hidden",
                })}
              >
                Espace Avocat
                <IconArrowRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 sm:block" />
              </Link>
            </>
          )}

          {/* Sous `lg`, tout ce qui précède est masqué : le panneau prend le
              relais et porte les mêmes accès, avec la place de les nommer. */}
          <MobileNav
            links={navLinks}
            clientName={client?.client.pseudonym ?? null}
            hasAccount={session !== null}
          />
        </div>
      </div>
    </header>
  );
}

/** Deux lettres au plus, tirées du pseudonyme affiché. */
function initialsOf(pseudonym: string): string {
  const words = pseudonym.trim().split(/[\s-]+/).filter(Boolean);

  if (words.length === 0) return "?";

  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";

  return (first + last).toUpperCase();
}
