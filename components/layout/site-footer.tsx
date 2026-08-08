import Link from "next/link";
import { practiceAreas } from "@/lib/data/practice-areas";
import {
  IconFacebook,
  IconLinkedin,
  IconPhone,
  IconScale,
  IconShieldCheck,
  IconWhatsapp,
} from "@/components/ui/icons";

const columns = [
  {
    title: "Citoyens",
    links: [
      { label: "Poser mon problème", href: "/besoin/nouveau" },
      { label: "Espace communautaire", href: "/communaute" },
      { label: "Trouver un avocat", href: "/avocats" },
      { label: "Guides & articles", href: "/guides" },
      { label: "Comment ça marche", href: "/comment-ca-marche" },
      // Remplace « Diagnostic rapide », dont l'ancre vivait sur l'ancienne page
      // d'accueil : le lien menait à un fragment qui n'existe plus, et un lien
      // mort dans un pied de page rendu sur tout le site coûte doublement — au
      // visiteur qui clique, et au moteur qui l'explore.
      { label: "Mon espace citoyen", href: "/compte" },
    ],
  },
  {
    title: "Espace Avocat",
    links: [
      { label: "Rejoindre le réseau", href: "/avocats/inscription" },
      { label: "Espace praticien", href: "/avocats/espace-praticien" },
      { label: "Formules & tarifs", href: "/tarifs" },
      // Publier un guide et suivre ses rendez-vous se font dans l'espace
      // praticien, sections « Guides publiés » et « Rendez-vous » : ces liens
      // les ouvrent directement plutôt que de promettre des pages qui
      // n'existent pas.
      { label: "Publier un guide", href: "/avocats/espace-praticien?section=guides" },
      { label: "Mes rendez-vous", href: "/avocats/espace-praticien?section=rendez-vous" },
    ],
  },
  {
    title: "Institutionnel",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Charte déontologique", href: "/charte-deontologique" },
      { label: "Conditions générales", href: "/cgu" },
      { label: "Protection des données", href: "/confidentialite" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-marine-950/10 bg-panel text-marine-600">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          {/* Identité */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-gold-400 to-gold-600 text-white shadow-gold">
                <IconScale className="size-5.5" strokeWidth={2} />
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-marine-950">
                Take<span className="text-gold-500">A</span>Lawyer
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm/relaxed">
              La plateforme qui relie les citoyens aux avocats inscrits au
              Barreau : dépôt de besoin anonyme, réponses qualifiées et guides
              juridiques signés.
            </p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-marine-700 ring-1 ring-marine-950/8 ring-inset">
              <IconShieldCheck className="size-4 text-trust-400" />
              Profils contrôlés avant publication
            </p>

            <div className="mt-6 flex items-center gap-2">
              {[
                { href: "https://facebook.com", label: "Facebook", Icon: IconFacebook },
                { href: "https://linkedin.com", label: "LinkedIn", Icon: IconLinkedin },
                { href: "https://wa.me/237600000000", label: "WhatsApp", Icon: IconWhatsapp },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full bg-steel text-white transition-colors hover:bg-gold-500"
                >
                  <Icon className="size-4" />
                </a>
              ))}
              <a
                href="tel:+237600000000"
                className="ml-1 inline-flex items-center gap-2 rounded-full border border-marine-950/12 px-4 py-2.5 text-sm font-medium text-marine-700 transition-colors hover:border-gold-500 hover:text-gold-700"
              >
                <IconPhone className="size-4" />
                Support
              </a>
            </div>
          </div>

          {/* Liens */}
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-gold-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Domaines — maillage interne pour le SEO (module 3.3). Les liens
            pointent vers les pages d'atterrissage et non vers l'annuaire
            filtré : une page de domaine porte du contenu indexable, une URL à
            paramètres n'en porte aucun. */}
        <div className="mt-14 border-t border-marine-950/10 pt-8">
          <p className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
            <Link href="/domaines" className="transition-colors hover:text-gold-700">
              Domaines du droit
            </Link>
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {practiceAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/domaines/${area.slug}`}
                  className="text-sm transition-colors hover:text-gold-700"
                >
                  {area.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barre légale */}
      <div className="border-t border-marine-950/10">
        <div className="container-page flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-marine-600">
            © {new Date().getFullYear()} TakeALawyer. Tous droits réservés.
          </p>
          <p className="max-w-2xl text-xs/relaxed text-marine-500">
            TakeALawyer est une plateforme de mise en relation. Elle n’est pas un
            cabinet d’avocats et ne délivre aucune consultation juridique : seuls
            les avocats inscrits au Barreau, référencés sur la plateforme, sont
            habilités à conseiller et représenter.
          </p>
        </div>
      </div>
    </footer>
  );
}
