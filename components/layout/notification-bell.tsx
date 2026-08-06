import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchBadges, type Viewer } from "@/lib/api/desk";
import { IconBell, IconMessages } from "@/components/ui/icons";

/**
 * Cloche de notifications et pastille de messagerie de l'en-tête.
 *
 * Composant serveur : les compteurs sont lus avec la session, sans état client
 * ni scintillement au chargement. Rien n'est rendu pour un visiteur anonyme —
 * une cloche vide n'invite à rien et prend la place du bouton d'action.
 *
 * Les deux versants sont additionnés dans le compteur, mais le lien pointe vers
 * celui qui a quelque chose à montrer : un avocat qui reçoit une demande de
 * rendez-vous doit atterrir sur sa file praticien, pas sur sa file citoyenne
 * vide.
 */
export async function NotificationBell({ className }: { className?: string }) {
  const badges = await fetchBadges();

  if (!badges.client && !badges.account) return null;

  const notifications =
    (badges.client?.notifications ?? 0) + (badges.account?.notifications ?? 0);
  const messages = (badges.client?.messages ?? 0) + (badges.account?.messages ?? 0);

  // Le versant qui a des non-lus passe devant ; à égalité, le citoyen — c'est
  // le profil le plus courant.
  const target: Viewer =
    (badges.account?.notifications ?? 0) > (badges.client?.notifications ?? 0)
      ? "account"
      : "client";

  const param = target === "account" ? "avocat" : "citoyen";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {messages > 0 && (
        <IconLink
          href={`/messages?profil=${param}`}
          label={`Messages — ${messages} non lu${messages > 1 ? "s" : ""}`}
          count={messages}
        >
          <IconMessages className="size-5" />
        </IconLink>
      )}

      <IconLink
        href={`/notifications?profil=${param}`}
        label={
          notifications > 0
            ? `Notifications — ${notifications} non lue${notifications > 1 ? "s" : ""}`
            : "Notifications"
        }
        count={notifications}
      >
        <IconBell className="size-5" />
      </IconLink>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function IconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative grid size-10 shrink-0 place-items-center rounded-full text-marine-700 transition-colors hover:bg-white/70 hover:text-gold-700"
    >
      {children}

      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 grid min-w-4.5 place-items-center rounded-full bg-gold-500 px-1 text-[0.65rem] font-bold text-marine-950 ring-2 ring-panel"
        >
          {/* Au-delà de neuf, le nombre exact n'aide plus : il ne fait
              qu'élargir la pastille au point de déborder de l'icône. */}
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
