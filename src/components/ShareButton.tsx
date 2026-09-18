"use client";

import { useState } from "react";

interface Props {
  titulo: string;
  slug: string;
}

export default function ShareButton({ titulo, slug }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = `${window.location.origin}/nota/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // El usuario canceló el share sheet: no hacer nada.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard no disponible: no hacer nada.
    }
  }

  return (
    <button
      type="button"
      className="btn-share-icon"
      onClick={compartir}
      aria-label="Compartir nota"
      title="Compartir nota"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </svg>
      {copiado && <span className="btn-share-tooltip">Link copiado</span>}
    </button>
  );
}
