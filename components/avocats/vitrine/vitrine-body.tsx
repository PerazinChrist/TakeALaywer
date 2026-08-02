"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";
import {
  PanelAPropos,
  PanelApercu,
  PanelAvis,
  PanelGalerie,
  PanelGuides,
} from "@/components/avocats/vitrine/vitrine-panels";
import { IconMore } from "@/components/ui/icons";

/**
 * Corps de la vitrine : la barre d'onglets pleine largeur, puis la grille
 * « colonne d'informations + contenu » de la maquette de référence.
 *
 * La barre d'onglets et le panneau doivent partager le même état, mais la
 * colonne de gauche reste rendue côté serveur : elle est passée en `sidebar`
 * plutôt que reconstruite ici.
 */
export function VitrineBody({
  profile,
  sidebar,
}: {
  profile: LawyerProfile;
  sidebar: ReactNode;
}) {
  const [tab, setTab] = useState("tout");

  const tabs = [
    { id: "tout", label: "Tout" },
    { id: "apropos", label: "À propos" },
    {
      id: "guides",
      label: "Guides",
      count: profile.guides.filter((g) => g.status === "publie").length,
    },
    {
      id: "galerie",
      label: "Photos",
      count: profile.albums.reduce((n, a) => n + a.photos.length, 0),
    },
    { id: "avis", label: "Avis", count: profile.reviewsCount },
  ];

  return (
    <>
      {/* ---------------- Onglets ---------------- */}
      <div className="border-b border-marine-950/10 bg-white">
        <div className="container-page flex items-center justify-between gap-4">
          <nav
            className="scrollbar-none -mb-px flex min-w-0 gap-1 overflow-x-auto"
            aria-label="Sections de la vitrine"
          >
            {tabs.map((item) => {
              const active = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 border-b-[3px] px-4 py-4 text-[0.95rem] font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "border-gold-500 text-gold-700"
                      : "border-transparent text-marine-600 hover:border-marine-950/15 hover:text-marine-900",
                  )}
                >
                  {item.label}
                  {item.count !== undefined && (
                    <span
                      className={cn(
                        "ml-1.5 text-xs font-medium",
                        active ? "text-gold-600" : "text-marine-400",
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label="Plus de sections"
            className="my-2 grid size-9 shrink-0 place-items-center rounded-full bg-marine-50 text-marine-600 transition-colors hover:bg-marine-100"
          >
            <IconMore className="size-4" />
          </button>
        </div>
      </div>

      {/* ---------------- Contenu ---------------- */}
      <div className="container-page py-6 lg:py-8">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div>{sidebar}</div>

          <div>
            {tab === "tout" && (
              <PanelApercu profile={profile} onNavigate={setTab} />
            )}
            {tab === "apropos" && <PanelAPropos profile={profile} />}
            {tab === "guides" && <PanelGuides profile={profile} />}
            {tab === "galerie" && <PanelGalerie profile={profile} />}
            {tab === "avis" && <PanelAvis profile={profile} />}
          </div>
        </div>
      </div>
    </>
  );
}
