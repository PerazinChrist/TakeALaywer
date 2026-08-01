"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconArrowRight,
  IconFacebook,
  IconLinkedin,
  IconScale,
  IconSparkles,
  IconWhatsapp,
} from "@/components/ui/icons";

/** Liens de la barre — séparés par des puces rondes, comme sur la référence. */
const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/avocats", label: "Avocats" },
  { href: "/guides", label: "Guides" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", Icon: IconFacebook },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: IconLinkedin },
  { href: "https://wa.me/237600000000", label: "WhatsApp", Icon: IconWhatsapp },
];

/** Contenu du panneau ouvert par le bouton menu (visible à toutes les tailles). */
const menuColumns = [
  {
    title: "Citoyens",
    links: [
      { href: "/besoin/nouveau", label: "Poser mon besoin" },
      { href: "/avocats", label: "Trouver un avocat" },
      { href: "/guides", label: "Guides & articles" },
      { href: "/#diagnostic", label: "Diagnostic rapide" },
    ],
  },
  {
    title: "Espace Avocat",
    links: [
      { href: "/avocats/inscription", label: "Rejoindre le réseau" },
      { href: "/avocats/espace-praticien", label: "Espace praticien" },
      { href: "/tarifs", label: "Offre Pionnière" },
      { href: "/avocats/publier", label: "Publier un guide" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le panneau ouvert bloque le défilement et se ferme avec Échap.
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/*
        Bandeau repris de la maquette : fond gris clair, bloc unique aligné à
        gauche (liens + puces + pastilles + menu), moitié droite laissée libre.
      */}
      <div
        className={cn(
          "bg-panel transition-shadow duration-300",
          scrolled || open ? "shadow-[0_12px_30px_-26px_rgb(15_23_42/0.55)]" : "",
        )}
      >
        <div className="container-page flex h-20 items-center justify-between gap-6 lg:justify-start lg:gap-10 xl:gap-14">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="TakeALawyer, retour à l’accueil"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-gold-400 to-gold-600 text-white shadow-gold">
              <IconScale className="size-5.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-marine-950">
              Take<span className="text-gold-500">A</span>Lawyer
            </span>
          </Link>

          {/* Liens séparés par des puces rondes */}
          <nav className="hidden items-center lg:flex" aria-label="Navigation principale">
            {navLinks.map((link, i) => (
              <Fragment key={link.href}>
                {i > 0 && (
                  <span
                    className="mx-6 size-[7px] shrink-0 rounded-full bg-marine-950/85"
                    aria-hidden="true"
                  />
                )}
                <Link
                  href={link.href}
                  className="text-[0.95rem] font-medium whitespace-nowrap text-marine-950 transition-colors hover:text-gold-600"
                >
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </nav>

          {/* Pastilles rondes des réseaux, puis bouton menu */}
          <div className="flex items-center gap-7">
            <div className="hidden items-center gap-2 md:flex">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-7 place-items-center rounded-full bg-steel text-white transition-colors hover:bg-gold-500"
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>

            <MenuToggle open={open} onToggle={() => setOpen((v) => !v)} />
          </div>
        </div>
      </div>

      {/* Panneau de navigation complet */}
      {open && (
        <>
          <div
            className="animate-fade-in fixed inset-0 -z-10 bg-marine-950/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            id="menu-principal"
            className="animate-fade-up border-b border-marine-950/8 bg-white shadow-card"
          >
            <div className="container-page grid gap-8 py-8 md:grid-cols-3 lg:gap-12 lg:py-10">
              {menuColumns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <p className="rule-gold text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase">
                    {column.title}
                  </p>
                  <ul className="mt-5 space-y-1">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.95rem] font-medium text-marine-800 transition-colors hover:bg-marine-50 hover:text-marine-950"
                        >
                          {link.label}
                          <IconArrowRight className="size-4 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              {/* Rappel de l'Offre Pionnière + accès compte */}
              <div className="flex flex-col justify-between gap-5 rounded-2xl bg-linear-to-br from-gold-300 via-gold-400 to-gold-600 p-6">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.18em] text-marine-900/75 uppercase">
                    <IconSparkles className="size-3.5" />
                    Offre Pionnière
                  </p>
                  <p className="mt-3 font-serif text-lg/snug font-bold text-marine-950">
                    Inscription et profil vérifié offerts aux 500 premiers avocats
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/besoin/nouveau"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-marine-950 px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Poser mon besoin (gratuit)
                  </Link>
                  <Link
                    href="/connexion"
                    onClick={() => setOpen(false)}
                    className={buttonStyles({
                      variant: "outline",
                      size: "sm",
                      full: true,
                      className: "h-11 border-marine-950/25 bg-transparent hover:bg-white/40",
                    })}
                  >
                    Connexion
                  </Link>
                </div>
              </div>
            </div>

            {/* Réseaux — repris ici pour les écrans qui les masquent dans la barre */}
            <div className="container-page flex items-center gap-2 border-t border-marine-950/6 py-4 md:hidden">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full bg-steel text-white transition-colors hover:bg-gold-500"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/**
 * Bouton menu : trois barres épaisses, sans contour, comme sur la référence.
 * Il se transforme en croix à l'ouverture.
 */
function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  // Trois barres pleines de 3px espacees de 4px, comme sur la maquette :
  // chaque barre exterieure parcourt 7px pour rejoindre le centre.
  const bar = "block h-[3px] w-7 bg-marine-950 transition-all duration-300";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="menu-principal"
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      className="flex size-11 shrink-0 flex-col items-center justify-center gap-1"
    >
      <span
        className={bar}
        style={{ transform: open ? "translateY(7px) rotate(45deg)" : undefined }}
      />
      <span className={bar} style={{ opacity: open ? 0 : 1 }} />
      <span
        className={bar}
        style={{ transform: open ? "translateY(-7px) rotate(-45deg)" : undefined }}
      />
    </button>
  );
}
