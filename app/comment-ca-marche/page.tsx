import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { PageHeaderBackdrop } from "@/components/public/page-header-backdrop";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonStyles } from "@/components/ui/button";
import { fetchStats } from "@/lib/api/public";
import { groupDigits } from "@/lib/utils";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconIncognito,
  IconLock,
  IconMessage,
  IconScale,
  IconSend,
  IconShieldCheck,
} from "@/components/ui/icons";

/** Les compteurs affichés viennent de la base. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Comment ça marche",
  description:
    "Déposez votre besoin sous pseudonyme, comparez les réponses des avocats vérifiés, ou réglez votre situation seul avec un guide. Le parcours détaillé, étape par étape.",
  path: "/comment-ca-marche",
});

const STEPS = [
  {
    step: "01",
    Icon: IconSend,
    title: "Vous exposez votre situation",
    lead: "Trois minutes, sans jargon et sans donner votre nom.",
    details: [
      "Un formulaire guidé traduit votre situation en domaine du droit — vous n’avez pas à savoir si votre problème relève du droit du travail ou du droit des contrats.",
      "Vous choisissez un pseudonyme. C’est la seule identité que verront les avocats tant que vous n’aurez pas accepté d’aller plus loin.",
      "Vous indiquez le degré d’urgence : il détermine la priorité d’acheminement.",
    ],
  },
  {
    step: "02",
    Icon: IconMessage,
    title: "Les avocats compétents vous répondent",
    lead: "Votre demande part vers ceux dont c’est la spécialité, dans votre ressort.",
    details: [
      "Chaque avocat sollicité est vérifié : attestation d’inscription au Barreau, carte professionnelle et pièce d’identité contrôlées avant que sa fiche n’existe.",
      "Il répond par une proposition claire ou une invitation à un rendez-vous, en indiquant ses honoraires.",
      "Vous comparez les réponses reçues et n’en retenez qu’une. Les autres n’ont jamais eu votre identité.",
    ],
  },
  {
    step: "03",
    Icon: IconShieldCheck,
    title: "Vous décidez de la suite",
    lead: "Consulter, ou régler la situation seul avec un guide.",
    details: [
      "Vous acceptez le contact d’un avocat : l’échange se poursuit alors en messagerie privée, et lui seul accède aux pièces que vous déposez.",
      "Ou vous préférez agir seul : la bibliothèque contient des guides et des modèles écrits par des avocats, dès 250 FCFA.",
      "Dans les deux cas, vous pouvez déposer un avis après l’échange. Il est modéré avant publication.",
    ],
  },
];

const GUARANTEES = [
  {
    Icon: IconIncognito,
    title: "Votre identité vous appartient",
    body: "Aucun avocat ne connaît votre nom avant que vous ne l’ayez décidé. Le pseudonyme n’est pas une option, c’est le fonctionnement par défaut.",
  },
  {
    Icon: IconBadgeCheck,
    title: "Des avocats, pas des annonces",
    body: "Une fiche n’existe qu’après vérification des justificatifs, et disparaît de l’annuaire dès qu’un compte est suspendu.",
  },
  {
    Icon: IconLock,
    title: "Rien ne se paie à l’aveugle",
    body: "Les honoraires indicatifs figurent sur chaque fiche. Un guide payant laisse lire environ 30 % de son contenu avant tout paiement.",
  },
  {
    Icon: IconScale,
    title: "Nous ne sommes pas un cabinet",
    body: "La plateforme met en relation, elle ne conseille pas. La relation se noue entre vous et l’avocat, et le secret professionnel s’applique.",
  },
];

const FAQ = [
  {
    question: "Combien coûte le dépôt d’un besoin ?",
    answer:
      "Rien. Déposer un besoin et recevoir des réponses est gratuit. Vous ne payez que si vous engagez une prestation avec un avocat, ou si vous débloquez un guide.",
  },
  {
    question: "En combien de temps vais-je recevoir une réponse ?",
    answer:
      "La plupart des demandes reçoivent une première réponse dans la journée. Aucun délai n’est garanti : cela dépend du nombre d’avocats disponibles dans le domaine et le ressort concernés.",
  },
  {
    question: "Et si personne ne me répond ?",
    answer:
      "Cela peut arriver sur un domaine peu représenté. Vous pouvez élargir votre demande à un autre ressort, ou commencer par un guide sur le sujet en attendant.",
  },
  {
    question: "L’avocat voit-il mon nom ?",
    answer:
      "Non, pas avant votre accord explicite. Il voit votre pseudonyme, votre ville et la description de votre situation. Vous restez libre de ne jamais vous découvrir.",
  },
  {
    question: "Puis-je déposer un avis sans avoir de compte ?",
    answer:
      "Oui. Un avis déposé depuis un compte citoyen porte la mention « certifié », car nous pouvons rattacher l’avis à une personne réelle. Les autres sont publiés après modération, sans cette mention.",
  },
  {
    question: "Que se passe-t-il si un avocat ne me convient pas ?",
    answer:
      "Vous n’êtes engagé qu’à partir de la signature d’une convention d’honoraires. Avant cela, accepter un contact ne vous lie à rien, et vous pouvez y mettre fin.",
  },
];

export default async function CommentCaMarchePage() {
  const stats = await fetchStats();

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-16">
        <header className="relative isolate border-b border-marine-950/8 bg-marine-950">
          {/* Signature d'une convention : l'aboutissement du parcours décrit
              plus bas. Cadrage bas pour rester sur la table et les mains. */}
          <PageHeaderBackdrop
            image="/headers/comment-ca-marche.webp"
            position="center 62%"
            priority
          />

          <div className="container-page py-14 lg:py-20">
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">
              Comment ça marche
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl/tight font-bold text-white sm:text-4xl/tight lg:text-5xl/tight">
              De votre question à la réponse d’un avocat, en trois étapes
            </h1>
            <p className="mt-5 max-w-2xl text-[1.05rem]/relaxed text-marine-100">
              Le parcours complet, sans zone d’ombre : ce que vous donnez, ce que
              les avocats voient, ce que vous payez et à quel moment.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/besoin/nouveau" className={buttonStyles()}>
                <IconSend className="size-4" />
                Déposer mon besoin
              </Link>
              {/* `ghost` et non `outline` : le bandeau est désormais sombre. */}
              <Link href="/avocats" className={buttonStyles({ variant: "ghost" })}>
                Parcourir l’annuaire
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Les trois étapes, détaillées */}
        <section className="container-page py-14 lg:py-20" aria-labelledby="etapes">
          <h2 id="etapes" className="sr-only">
            Les trois étapes
          </h2>

          <ol className="space-y-6">
            {STEPS.map((entry) => (
              <li
                key={entry.step}
                className="grid gap-6 rounded-3xl bg-white p-7 ring-1 ring-marine-950/6 sm:p-9 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10"
              >
                <div className="flex items-start gap-4 lg:w-52 lg:flex-col lg:gap-5">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-50 text-gold-600 ring-1 ring-gold-500/15 ring-inset">
                    <entry.Icon className="size-6" />
                  </span>
                  <span className="font-serif text-4xl font-bold text-marine-200">
                    {entry.step}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl/snug font-bold text-marine-950">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-[1.05rem] text-gold-700">{entry.lead}</p>

                  <ul className="mt-5 space-y-3">
                    {entry.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3 text-[0.95rem]/relaxed text-marine-700">
                        <IconCheck className="mt-1 size-4 shrink-0 text-trust-600" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Garanties */}
        <section className="bg-white py-14 lg:py-20" aria-labelledby="garanties">
          <div className="container-page">
            <SectionHeading
              eyebrow="Nos engagements"
              title={<span id="garanties">Ce sur quoi vous pouvez compter</span>}
              description="Quatre règles qui gouvernent le fonctionnement de la plateforme, et qui ne se négocient pas."
            />

            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              {GUARANTEES.map((entry) => (
                <li key={entry.title} className="rounded-2xl bg-panel p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-white text-marine-700 ring-1 ring-marine-950/6 ring-inset">
                    <entry.Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold text-marine-950">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem]/relaxed text-marine-600">{entry.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Questions fréquentes */}
        <section className="container-page py-14 lg:py-20" aria-labelledby="faq">
          <SectionHeading
            eyebrow="Questions fréquentes"
            title={<span id="faq">Ce qu’on nous demande le plus souvent</span>}
          />

          <dl className="mt-10 divide-y divide-marine-950/8 border-y border-marine-950/8">
            {FAQ.map((entry) => (
              <div key={entry.question} className="grid gap-2 py-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10">
                <dt className="font-serif text-lg/snug font-bold text-marine-950">
                  {entry.question}
                </dt>
                <dd className="text-[0.95rem]/relaxed text-marine-600">{entry.answer}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-sm text-marine-500">
            {stats.directory > 0 ? (
              <>
                {groupDigits(stats.directory)} avocats et cabinets vérifiés,{" "}
                {groupDigits(stats.guides)} guides publiés et{" "}
                {groupDigits(stats.reviews)} avis certifiés à ce jour.
              </>
            ) : (
              "Les compteurs de la plateforme seront affichés ici dès la mise en service de l’annuaire."
            )}{" "}
            Une question qui ne figure pas ici ?{" "}
            <Link href="/contact" className="font-medium text-marine-700 hover:text-gold-700">
              Écrivez-nous
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
