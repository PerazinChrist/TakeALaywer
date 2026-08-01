import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** En-tête de section homogène sur toute la landing page. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p
          className={cn(
            "rule-gold text-[0.7rem] font-bold tracking-[0.22em] text-gold-600 uppercase",
            centered && "[&::after]:mx-auto",
          )}
        >
          {eyebrow}
        </p>
        <h2 className="mt-5 text-3xl/tight font-bold text-marine-950 sm:text-4xl/tight">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base/relaxed text-marine-600">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
