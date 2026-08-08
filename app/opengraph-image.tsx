import { ImageResponse } from "next/og";

/**
 * Image de partage par défaut.
 *
 * Elle est dessinée à la volée plutôt que fournie en fichier : aucun visuel du
 * dépôt n'est au format 1200 × 630, et une image au mauvais rapport est
 * recadrée n'importe comment par WhatsApp — le canal par lequel un lien
 * juridique circule le plus au Cameroun. Un partage sans vignette passe pour un
 * lien douteux, ce qui est exactement ce qu'une plateforme de mise en relation
 * ne peut pas se permettre.
 *
 * Les pages qui méritent leur propre visuel — une vitrine, un guide — pourront
 * poser leur `opengraph-image` dans leur dossier : Next préfère toujours le plus
 * proche.
 */
export const alt = "TakeALawyer — Trouvez un avocat vérifié au Cameroun";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #15243c 55%, #24446a 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #f59e0b, #b45309)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            ⚖
          </div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700, color: "#ffffff" }}>
            Take<span style={{ color: "#f59e0b" }}>A</span>Lawyer
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.12,
              fontWeight: 700,
              color: "#ffffff",
              maxWidth: 900,
            }}
          >
            Vos démarches juridiques, traitées par des avocats qualifiés.
          </div>

          <div style={{ display: "flex", fontSize: 30, color: "#c8dae9", maxWidth: 880 }}>
            Avocats et cabinets vérifiés · Question gratuite et anonyme · Guides dès 250 FCFA
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 5, borderRadius: 999, background: "#f59e0b", display: "flex" }} />
          <div style={{ display: "flex", fontSize: 24, color: "#8aa9c6" }}>
            Cameroun · Inscrits au Barreau
          </div>
        </div>
      </div>
    ),
    size,
  );
}
