/**
 * Concatenation conditionnelle de classes.
 * Equivalent minimal de `clsx` (non installe dans ce projet).
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
