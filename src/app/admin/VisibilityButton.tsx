"use client";

import { useTransition } from "react";
import { cambiarVisibilidadNota } from "./actions";

interface Props {
  slug: string;
  titulo: string;
  oculta: boolean;
}

export default function VisibilityButton({ slug, titulo, oculta }: Props) {
  const [pending, startTransition] = useTransition();

  function alternar() {
    const mensaje = oculta
      ? `¿Volver a mostrar "${titulo}" en el sitio?`
      : `¿Ocultar "${titulo}" del sitio? Sigue guardada, solo deja de mostrarse.`;
    if (!window.confirm(mensaje)) return;

    startTransition(async () => {
      try {
        await cambiarVisibilidadNota(slug, !oculta);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "No se pudo actualizar la nota.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      style={{
        flexShrink: 0,
        background: "none",
        border: "1px solid #8A8079",
        color: "#8A8079",
        borderRadius: "4px",
        padding: "5px 10px",
        fontSize: "11px",
        fontWeight: 700,
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {pending ? "Guardando…" : oculta ? "Mostrar" : "Ocultar"}
    </button>
  );
}
