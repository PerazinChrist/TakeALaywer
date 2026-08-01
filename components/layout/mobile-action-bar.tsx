import Link from "next/link";
import { IconFileText, IconSearch, IconSend } from "@/components/ui/icons";

/**
 * Barre d'action flottante — directive-ui.md § 5.
 * Trois accès rapides toujours atteignables au pouce, sur mobile uniquement.
 */
export function MobileActionBar() {
  return (
    <nav
      aria-label="Actions rapides"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-marine-950/10 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 items-end px-4 pt-2 pb-2.5">
        <Link
          href="/avocats"
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-marine-600 transition-colors active:text-marine-950"
        >
          <IconSearch className="size-5.5" />
          <span className="text-[0.7rem] font-medium">Rechercher</span>
        </Link>

        {/* Action principale, surélevée */}
        <Link
          href="/besoin/nouveau"
          className="-mt-6 flex flex-col items-center gap-1.5"
          aria-label="Poser un besoin"
        >
          <span className="grid size-14 place-items-center rounded-full bg-gold-500 text-marine-950 shadow-gold ring-4 ring-white">
            <IconSend className="size-5.5" />
          </span>
          <span className="text-[0.7rem] font-semibold text-marine-950">Poser un besoin</span>
        </Link>

        <Link
          href="/guides"
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-marine-600 transition-colors active:text-marine-950"
        >
          <IconFileText className="size-5.5" />
          <span className="text-[0.7rem] font-medium">Articles</span>
        </Link>
      </div>
    </nav>
  );
}
