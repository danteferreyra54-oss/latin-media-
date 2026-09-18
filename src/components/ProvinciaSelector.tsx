"use client";

import { useEffect, useRef, useState } from "react";

const PROVINCIAS = [
  "Buenos Aires",
  "Córdoba",
  "Santa Fe",
  "Mendoza",
  "Tucumán",
  "Salta",
  "Neuquén",
  "Río Negro",
];

/**
 * Selector visual de provincia en la barra utilitaria. Por ahora no filtra
 * contenido: solo cambia el texto "Estás en <provincia>".
 */
export default function ProvinciaSelector() {
  const [abierto, setAbierto] = useState(false);
  const [provincia, setProvincia] = useState("Buenos Aires");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  return (
    <div className="prov-selector" ref={ref}>
      <span className="prov-texto">
        Estás en <strong>{provincia}</strong> ·{" "}
        <button
          type="button"
          className="prov-trigger"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          Elegí tu provincia
        </button>
      </span>

      {abierto && (
        <ul className="prov-dropdown">
          {PROVINCIAS.map((nombre) => (
            <li key={nombre}>
              <button
                type="button"
                className={nombre === provincia ? "activa" : undefined}
                onClick={() => {
                  setProvincia(nombre);
                  setAbierto(false);
                }}
              >
                {nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
