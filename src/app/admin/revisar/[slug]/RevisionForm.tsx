"use client";

import { useState, useTransition } from "react";
import { aprobarNota, corregirYAprobarNota, rechazarNota } from "./actions";

interface ArticuloRevision {
  slug: string;
  titulo: string;
  bajada: string;
  cuerpo: string;
  seccion: string;
  autor: string;
  fecha: string;
  fuente: string;
}

interface Props {
  articulo: ArticuloRevision;
}

type Estado =
  | { tipo: "idle" }
  | { tipo: "ok"; mensaje: string }
  | { tipo: "error"; mensaje: string };

export default function RevisionForm({ articulo }: Props) {
  const [titulo, setTitulo] = useState(articulo.titulo);
  const [bajada, setBajada] = useState(articulo.bajada);
  const [cuerpo, setCuerpo] = useState(articulo.cuerpo);
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  const [pending, startTransition] = useTransition();

  function ejecutar(accion: () => Promise<void>, mensajeOk: string) {
    setEstado({ tipo: "idle" });
    startTransition(async () => {
      try {
        await accion();
        setEstado({ tipo: "ok", mensaje: mensajeOk });
      } catch (error) {
        setEstado({
          tipo: "error",
          mensaje: error instanceof Error ? error.message : "Error inesperado",
        });
      }
    });
  }

  return (
    <main className="revision">
      <div className="revision-wrap">
        <header className="revision-head">
          <span className="revision-slug">/nota/{articulo.slug}</span>
          <span className="revision-meta">
            {articulo.seccion} · {articulo.autor} · {articulo.fuente}
          </span>
        </header>

        <label className="revision-campo">
          <span>Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={pending}
          />
        </label>

        <label className="revision-campo">
          <span>Copete</span>
          <textarea
            rows={3}
            value={bajada}
            onChange={(e) => setBajada(e.target.value)}
            disabled={pending}
          />
        </label>

        <label className="revision-campo">
          <span>Cuerpo</span>
          <textarea
            rows={22}
            className="revision-cuerpo"
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            disabled={pending}
          />
        </label>

        {estado.tipo === "error" && <p className="revision-msg revision-msg-error">{estado.mensaje}</p>}
        {estado.tipo === "ok" && <p className="revision-msg revision-msg-ok">{estado.mensaje}</p>}

        <div className="revision-botones">
          <button
            type="button"
            className="revision-btn"
            disabled={pending}
            onClick={() =>
              ejecutar(
                () =>
                  aprobarNota({
                    slug: articulo.slug,
                    titulo: articulo.titulo,
                    bajada: articulo.bajada,
                    cuerpo: articulo.cuerpo,
                  }),
                "Nota aprobada."
              )
            }
          >
            Aprobar
          </button>

          <button
            type="button"
            className="revision-btn revision-btn-primario"
            disabled={pending}
            onClick={() =>
              ejecutar(
                () => corregirYAprobarNota({ slug: articulo.slug, titulo, bajada, cuerpo }),
                "Cambios guardados y nota aprobada."
              )
            }
          >
            Corregir y aprobar
          </button>

          <button
            type="button"
            className="revision-btn revision-btn-rechazar"
            disabled={pending}
            onClick={() =>
              ejecutar(() => rechazarNota(articulo.slug), "Nota rechazada.")
            }
          >
            Rechazar
          </button>
        </div>
      </div>
    </main>
  );
}
