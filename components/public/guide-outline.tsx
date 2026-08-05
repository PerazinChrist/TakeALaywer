import { IconCheck, IconLock } from "@/components/ui/icons";

/**
 * Sommaire du guide, parties fermées comprises.
 *
 * Montrer les titres verrouillés est délibéré : c'est l'argument d'achat le
 * plus honnête dont dispose l'auteur — le lecteur voit exactement ce qu'il
 * n'a pas. Masquer jusqu'aux titres donnerait l'impression d'un guide plus
 * court qu'il n'est, et desservirait la vente autant que la confiance.
 */
export function GuideOutline({
  outline,
  locked,
}: {
  outline: { title: string; locked: boolean }[];
  locked: boolean;
}) {
  if (outline.length === 0) return null;

  return (
    <nav className="rounded-2xl bg-white p-5 ring-1 ring-marine-950/6" aria-labelledby="sommaire">
      <p id="sommaire" className="text-[0.7rem] font-bold tracking-[0.18em] text-marine-950 uppercase">
        Sommaire
      </p>

      <ol className="mt-4 space-y-2.5">
        {outline.map((section, index) => (
          <li key={`${section.title}-${index}`} className="flex items-start gap-2.5 text-sm/snug">
            {section.locked ? (
              <IconLock className="mt-0.5 size-3.5 shrink-0 text-gold-600" />
            ) : (
              <IconCheck className="mt-0.5 size-3.5 shrink-0 text-trust-600" />
            )}
            <span className={section.locked ? "text-marine-400" : "text-marine-800"}>
              {section.title}
            </span>
          </li>
        ))}
      </ol>

      {locked && (
        <p className="mt-4 border-t border-marine-950/6 pt-3 text-xs/relaxed text-marine-500">
          Les parties marquées d’un cadenas se débloquent avec le guide.
        </p>
      )}
    </nav>
  );
}
