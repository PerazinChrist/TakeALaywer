import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { BookingForm, type BookingContact } from "@/components/avocats/vitrine/booking-form";
import { fetchVitrine } from "@/lib/api/vitrine";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { formatFcfa } from "@/lib/utils";
import {
  IconChevronLeft,
  IconClock,
  IconMapPin,
  IconShieldCheck,
} from "@/components/ui/icons";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchVitrine(slug);

  if (!result) return { title: "Profil introuvable" };

  return {
    title: `Prendre rendez-vous avec ${result.profile.name}`,
    description: `Demandez un créneau auprès de ${result.profile.name}, ${result.profile.bar}. Réponse sous 48 heures ouvrées.`,
    alternates: { canonical: `/avocats/${result.profile.slug}/rendez-vous` },
  };
}

/**
 * Prise de rendez-vous auprès d'un cabinet.
 *
 * Page à part et non boîte de dialogue sur la vitrine : le lien doit pouvoir
 * être partagé, indexé, et rouvert après une création de compte. La réservation
 * d'une prestation précise, elle, reste dans une modale — elle part d'une carte
 * qu'on ne veut pas quitter.
 */
export default async function RendezVousPage({ params, searchParams }: Params) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const [result, session] = await Promise.all([fetchVitrine(slug), fetchCurrentClient()]);

  if (!result) notFound();

  const { profile } = result;

  const contact: BookingContact | null = session
    ? {
        name:
          [session.client.firstName, session.client.lastName].filter(Boolean).join(" ") ||
          session.client.pseudonym,
        email: session.client.email,
        phone: session.client.phone,
      }
    : null;

  const requested = single(query.prestation);
  const cheapest =
    profile.prestations.length > 0
      ? Math.min(...profile.prestations.map((item) => item.price))
      : 0;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <div className="border-b border-marine-950/8 bg-white">
          <div className="container-page py-4">
            <Link
              href={`/avocats/${profile.slug}`}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-marine-600 transition-colors hover:text-gold-700"
            >
              <IconChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Retour à la fiche de {profile.name}
            </Link>
          </div>
        </div>

        <div className="container-page py-8 lg:py-10">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-8">
              <h1 className="font-serif text-2xl/tight font-bold text-marine-950 sm:text-3xl/tight">
                Prendre rendez-vous avec {profile.name}
              </h1>
              <p className="mt-3 text-[0.95rem]/relaxed text-marine-600">
                Indiquez le créneau qui vous arrange : le cabinet le confirme ou
                vous en propose un autre. Aucun paiement n’est engagé à cette
                étape.
              </p>

              <div className="mt-7 border-t border-marine-950/8 pt-7">
                <BookingForm
                  lawyerSlug={profile.slug}
                  lawyerName={profile.name}
                  prestations={profile.prestations}
                  contact={contact}
                  signedIn={session !== null}
                  defaultPrestationId={requested}
                />
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
                <div className="flex items-center gap-3">
                  <Avatar initials={profile.initials} imageUrl={profile.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-bold text-marine-950">
                      {profile.name}
                    </p>
                    <p className="truncate text-xs text-marine-500">{profile.bar}</p>
                  </div>
                </div>

                {profile.reviewsCount > 0 && (
                  <Rating
                    value={profile.rating}
                    reviews={profile.reviewsCount}
                    className="mt-4"
                  />
                )}

                <dl className="mt-5 space-y-2.5 border-t border-marine-950/6 pt-5 text-sm">
                  <Row
                    icon={<IconMapPin className="size-4" />}
                    label="Adresse"
                    value={[profile.district, profile.city].filter(Boolean).join(", ")}
                  />
                  <Row
                    icon={<IconClock className="size-4" />}
                    label="Délai de réponse"
                    value={profile.responseTime}
                  />
                  {cheapest > 0 && (
                    <Row
                      icon={<IconShieldCheck className="size-4" />}
                      label="Honoraires"
                      value={`dès ${formatFcfa(cheapest)}`}
                    />
                  )}
                </dl>
              </div>

              <p className="flex items-start gap-2.5 rounded-2xl bg-white p-5 text-xs/relaxed text-marine-600 shadow-card ring-1 ring-marine-950/6">
                <IconShieldCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
                Une demande de rendez-vous n’engage rien. Les honoraires sont
                annoncés avant toute prestation, et se règlent auprès du cabinet.
              </p>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="inline-flex items-center gap-2 text-marine-500">
        <span className="text-marine-400" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="text-right font-semibold text-marine-950">{value}</dd>
    </div>
  );
}

/** Un paramètre d'URL répété ne doit pas casser la page. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
