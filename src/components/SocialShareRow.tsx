"use client";

import { useState } from "react";

interface Props {
  titulo: string;
  slug: string;
  imagen?: string;
}

export default function SocialShareRow({ titulo, slug, imagen }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);

  function abrir(construirUrl: (url: string, texto: string) => string) {
    const url = `${window.location.origin}/nota/${slug}`;
    window.open(
      construirUrl(url, titulo),
      "_blank",
      "noopener,noreferrer,width=600,height=520"
    );
  }

  function mostrarAviso(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 2500);
  }

  /**
   * Instagram no tiene una API web para abrir directo "Historias" desde un
   * sitio de escritorio — eso solo existe dentro de apps nativas. Lo más
   * cercano y honesto desde una web es: en mobile, compartir la imagen OG
   * dinámica (con título, copete, foto y autor) como archivo vía el share
   * sheet nativo. El compositor de Historias solo toma la imagen e ignora
   * el link, así que se copia ese link al portapapeles en paralelo.
   */
  async function compartirInstagram() {
    const url = `${window.location.origin}/nota/${slug}`;

    if (navigator.canShare) {
      try {
        // La imagen OG está disponible en /nota/[slug]/opengraph-image
        const ogImageUrl = `${window.location.origin}/nota/${slug}/opengraph-image`;
        const res = await fetch(ogImageUrl);
        const blob = await res.blob();
        const archivo = new File([blob], "nota.png", { type: "image/png" });

        if (navigator.canShare({ files: [archivo] })) {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            // Best-effort: si falla, el usuario todavía puede volver y copiarlo a mano.
          }
          await navigator.share({ files: [archivo], title: titulo, text: `${titulo} ${url}` });
          mostrarAviso("Link copiado — pegalo con el sticker de enlace en tu historia.");
          return;
        }
      } catch {
        // Sigue al siguiente intento (no debería llegar acá si la imagen OG existe).
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      mostrarAviso("Link copiado. Abrí Instagram y pegalo en tu historia.");
    } catch {
      // Nada más para hacer.
    }
  }

  return (
    <div className="nota-social" style={{ position: "relative" }}>
      <button
        type="button"
        className="nota-social-btn"
        aria-label="Compartir en X"
        title="Compartir en X"
        onClick={() =>
          abrir(
            (url, texto) =>
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`
          )
        }
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      <button
        type="button"
        className="nota-social-btn"
        aria-label="Compartir en WhatsApp"
        title="Compartir en WhatsApp"
        onClick={() =>
          abrir((url, texto) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${texto} ${url}`)}`)
        }
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.14-.2.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17 0-.36-.02-.56-.02-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.19 3.01.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.37-.07-.12-.26-.19-.55-.34z" />
          <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.5 22 22 17.52 22 12S17.5 2 12.02 2m0 18.15a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.02.79.8-2.94-.19-.3a8.15 8.15 0 1 1 6.87 3.77" />
        </svg>
      </button>

      <button
        type="button"
        className="nota-social-btn"
        aria-label="Compartir en Instagram"
        title="Compartir en Instagram"
        onClick={compartirInstagram}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {aviso && <span className="nota-social-aviso">{aviso}</span>}
    </div>
  );
}
