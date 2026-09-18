"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import VisibilityButton from "./VisibilityButton";

interface Articulo {
  id: string;
  titulo: string;
  seccion: string;
  autor: string;
  fecha: string;
  slug: string;
  fuente: string;
  oculta?: boolean;
}

interface Props {
  articulos: Articulo[];
  adminKey: string;
  posiblesDuplicados: string[];
  ocultas?: boolean;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function AdminArticleList({ articulos, adminKey, posiblesDuplicados, ocultas = false }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const duplicados = useMemo(() => new Set(posiblesDuplicados), [posiblesDuplicados]);

  const filtrados = useMemo(() => {
    const query = normalizar(busqueda.trim());
    if (!query) return articulos;
    return articulos.filter((a) => normalizar(a.titulo).includes(query));
  }, [articulos, busqueda]);

  return (
    <div>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por palabras del título…"
        style={{
          width: "100%",
          fontSize: "14px",
          padding: "10px 14px",
          border: "1px solid #DDD5C8",
          borderRadius: "6px",
          marginBottom: "16px",
          fontFamily: "inherit",
          color: "#191512",
        }}
      />

      {busqueda.trim() !== "" && (
        <p style={{ fontSize: "12.5px", color: "#8A8079", marginBottom: "10px" }}>
          {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
        </p>
      )}

      {filtrados.length === 0 ? (
        <p style={{ color: "#8A8079", fontSize: "14px" }}>No hay notas para mostrar.</p>
      ) : (
        <div style={{ border: "1px solid #DDD5C8", borderRadius: "8px", overflow: "hidden" }}>
          {filtrados.map((articulo, i) => (
            <div
              key={articulo.id}
              className="admin-row"
              style={{ borderTop: i === 0 ? "none" : "1px solid #E9E2D6" }}
            >
              <Link href={`/admin/revisar/${articulo.slug}?key=${adminKey}`} className="admin-row-link">
                <span className="admin-seccion">{articulo.seccion}</span>
                <span className="admin-titulo">
                  <span className="admin-titulo-texto">{articulo.titulo}</span>
                  {duplicados.has(articulo.id) && (
                    <span className="admin-badge-dup" title="Otra nota reciente comparte palabras clave del título">
                      posible duplicado
                    </span>
                  )}
                </span>
                <span className="admin-autor">{articulo.autor}</span>
                <span className="admin-fecha">
                  {new Date(articulo.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                </span>
              </Link>

              <div className="admin-acciones">
                <Link
                  href={`/admin/editar/${articulo.slug}?key=${adminKey}`}
                  style={{
                    flexShrink: 0,
                    border: "1px solid #191512",
                    color: "#191512",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Editar
                </Link>

                <VisibilityButton
                  slug={articulo.slug}
                  titulo={articulo.titulo}
                  adminKey={adminKey}
                  oculta={ocultas}
                />

                <DeleteButton slug={articulo.slug} titulo={articulo.titulo} adminKey={adminKey} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
