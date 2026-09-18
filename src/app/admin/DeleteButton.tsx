"use client";

import { useTransition } from "react";
import { eliminarNota } from "./actions";

interface Props {
  slug: string;
  titulo: string;
  adminKey: string;
}

export default function DeleteButton({ slug, titulo, adminKey }: Props) {
  const [pending, startTransition] = useTransition();

  function eliminar() {
    if (!window.confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;

    startTransition(async () => {
      try {
        await eliminarNota(adminKey, slug);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "No se pudo eliminar la nota.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={eliminar}
      disabled={pending}
      style={{
        flexShrink: 0,
        background: "none",
        border: "1px solid #A81419",
        color: "#A81419",
        borderRadius: "4px",
        padding: "5px 10px",
        fontSize: "11px",
        fontWeight: 700,
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
