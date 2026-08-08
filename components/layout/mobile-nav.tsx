"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import {
  IconArrowRight,
  IconFileText,
  IconScale,
  IconSend,
  IconUser,
} from "@/components/ui/icons";

export type NavLink = { href: string; label: string };

/**
 * Navigation mobile de l'en-tête.
 *
 * L'en-tête n'affiche ses liens qu'à partir de `lg`. En dessous, il n'y avait
 * rien : ni menu, ni sommaire — la barre d'action du bas ne mène qu'à trois
 * destinations, et le reste du site n'était atteignable qu'en faisant défiler
 * jusqu'au pied de page. Sur un téléphone, c'est-à-dire pour la majorité des
 * visiteurs de la plateforme, l'annuaire, la communauté et les tarifs étaient
 * donc hors d'atteinte depuis le haut de n'importe quelle page.
 *
 * Le panneau reprend les liens principaux, y ajoute l'accès au compte — que la
 * barre du haut ne peut plus loger sous 640 px — et les raccourcis
 * institutionnels du pied de page les plus demandés.
 */
export function MobileNav({
  links,
  clientName,
  hasAccount,
}: {
  links: NavLink[];
  /** Pseudonyme du citoyen connecté, ou null. */
  clientName: string | null;
  /** Une session praticien est ouverte. */
  hasAccount: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /*
   * Un changement de page ferme le panneau. Sans cela, la navigation client de
   * Next remplace le contenu derrière un panneau resté ouvert : on croit que le
   * lien n'a rien fait.
   *
   * L'ajustement se fait pendant le rendu et non dans un effet : React reprend
   * alors le rendu immédiatement avec la nouvelle valeur, sans jamais peindre
   * l'état intermédiaire — le panneau ne clignote pas ouvert avant de se
   * refermer.
   */
  const [renderedPath, setRenderedPath] = useState(pathname);

  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    // Le défilement du document est gelé pendant l'ouverture : sans cela, le
    // doigt fait défiler la page derrière le panneau au lieu de son contenu.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    // Le focus entre dans le panneau, faute de quoi la tabulation continuerait
    // dans la page masquée — invisible et pourtant atteignable.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const signedIn = clientName !== null || hasAccount;

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-xl transition-colors active:bg-marine-950/5 lg:hidden"
      >
        <Bar shift={open ? "translateY(7px) rotate(45deg)" : undefined} />
        <Bar opacity={open ? 0 : 1} />
        <Bar shift={open ? "translateY(-7px) rotate(-45deg)" : undefined} />
      </button>

      {open && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-marine-950/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            id="menu-mobile"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            className="absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col bg-white shadow-2xl outline-none"
          >
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-marine-950/8 px-5">
              <span className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-gold-400 to-gold-600 text-white">
                  <IconScale className="size-5" strokeWidth={2} />
                </span>
                <span className="font-serif text-lg font-bold text-marine-950">
                  Take<span className="text-gold-500">A</span>Lawyer
                </span>
              </span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="grid size-10 place-items-center rounded-full text-marine-500 transition-colors hover:bg-marine-50 hover:text-marine-950"
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>

            {/* `overscroll-contain` empêche le défilement de « passer » à la page
                du dessous une fois le bas du panneau atteint. */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <nav aria-label="Navigation principale">
                <ul className="space-y-1">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={`group flex min-h-12 items-center justify-between rounded-xl px-3.5 text-[0.95rem] font-medium transition-colors ${
                          pathname === link.href
                            ? "bg-gold-500/10 text-gold-700"
                            : "text-marine-800 hover:bg-marine-50 hover:text-marine-950"
                        }`}
                      >
                        {link.label}
                        <IconArrowRight className="size-4 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6 space-y-2.5 border-t border-marine-950/8 pt-6">
                <Link
                  href="/besoin/nouveau"
                  className={buttonStyles({ variant: "gold", size: "md", full: true })}
                >
                  <IconSend className="size-4" />
                  Poser mon besoin — gratuit
                </Link>

                <Link
                  href="/guides"
                  className={buttonStyles({ variant: "outline", size: "md", full: true })}
                >
                  <IconFileText className="size-4" />
                  Guides dès 250 FCFA
                </Link>
              </div>

              <div className="mt-6 border-t border-marine-950/8 pt-6">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-400 uppercase">
                  Mon compte
                </p>

                <ul className="mt-3 space-y-1">
                  {clientName && (
                    <li>
                      <Link
                        href="/compte"
                        className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[0.95rem] font-medium text-marine-800 transition-colors hover:bg-marine-50"
                      >
                        <Avatar initials={initialsOf(clientName)} size="sm" />
                        <span className="truncate">{clientName}</span>
                      </Link>
                    </li>
                  )}

                  {hasAccount && (
                    <li>
                      <AccountLink href="/avocats/espace-praticien">
                        Espace praticien
                      </AccountLink>
                    </li>
                  )}

                  {!signedIn && (
                    <>
                      <li>
                        <AccountLink href="/compte/connexion">
                          <IconUser className="size-4 text-marine-400" />
                          Se connecter
                        </AccountLink>
                      </li>
                      <li>
                        <AccountLink href="/avocats/inscription">
                          <IconScale className="size-4 text-marine-400" />
                          Je suis avocat — rejoindre
                        </AccountLink>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="mt-6 border-t border-marine-950/8 pt-6">
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-400 uppercase">
                  En savoir plus
                </p>

                <ul className="mt-3 space-y-1">
                  {SECONDARY_LINKS.map((link) => (
                    <li key={link.href}>
                      <AccountLink href={link.href}>{link.label}</AccountLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Destinations que la barre du haut ne montre pas, mais qui sont demandées. */
const SECONDARY_LINKS: NavLink[] = [
  { href: "/domaines", label: "Domaines du droit" },
  { href: "/tarifs", label: "Formules & tarifs" },
  { href: "/contact", label: "Nous contacter" },
];

function AccountLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-2.5 rounded-xl px-3.5 text-[0.95rem] font-medium text-marine-800 transition-colors hover:bg-marine-50 hover:text-marine-950"
    >
      {children}
    </Link>
  );
}

/** Barre du bouton menu. */
function Bar({ shift, opacity }: { shift?: string; opacity?: number }) {
  return (
    <span
      className="block h-[3px] w-6.5 rounded-full bg-marine-950 transition-all duration-300"
      style={{ transform: shift, opacity }}
    />
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
