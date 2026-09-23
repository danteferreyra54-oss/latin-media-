"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { claseSeccion } from "./seccionColor";
import type { ItemUltimasNoticias } from "@/types/article";

const MINIMO = 2;

/**
 * Titulares bajo la nota principal. Rellenan el espacio que queda libre entre la nota
 * principal y el final de las columnas laterales: se muestran los que entran enteros
 * (mínimo 2, aunque agranden un poco el bloque).
 */
export default function HpTambien({ items }: { items: ItemUltimasNoticias[] }) {
  const caja = useRef<HTMLDivElement>(null);
  const [cantidad, setCantidad] = useState(items.length);
  const [justo, setJusto] = useState(true);

  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return;

    const medir = () => {
      const hijos = Array.from(el.querySelectorAll<HTMLElement>(".hp-li"));
      // medir con todos visibles
      hijos.forEach((h) => (h.style.display = ""));
      const alto = el.clientHeight;
      const titulo = el.querySelector<HTMLElement>(".hp-tambien-hd");
      const base = titulo ? titulo.offsetTop + titulo.offsetHeight : 0;
      let entran = 0;
      for (const h of hijos) {
        if (h.offsetTop + h.offsetHeight - base <= alto - base) entran++;
        else break;
      }
      const mostrar = Math.min(items.length, Math.max(MINIMO, entran));
      hijos.forEach((h, i) => (h.style.display = i < mostrar ? "" : "none"));
      setCantidad(mostrar);
      setJusto(entran >= MINIMO);
    };

    medir();
    const obs = new ResizeObserver(medir);
    if (el.parentElement) obs.observe(el.parentElement);
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      ref={caja}
      className={`hp-tambien${justo ? "" : " hp-tambien--libre"}`}
      data-cantidad={cantidad}
    >
      <h2 className="hp-tambien-hd">También en portada</h2>
      {items.map((nota) => (
        <Link
          key={nota.slug}
          href={`/nota/${nota.slug}`}
          className={`hp-li ${claseSeccion(nota.seccion)}`}
        >
          <span className="hp-li-cat">{nota.seccion}</span>
          <span className="hp-li-title">{nota.titulo}</span>
          <span className="hp-li-time">{nota.hora}</span>
        </Link>
      ))}
    </div>
  );
}
