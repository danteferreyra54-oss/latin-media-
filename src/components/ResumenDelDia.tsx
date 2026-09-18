import Link from "next/link";
import type { ResumenDiaItem } from "@/types/article";

interface Props {
  items: ResumenDiaItem[];
}

export default function ResumenDelDia({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="resumen-dia">
      <div className="resumen-head">
        <h2>
          <span className="lin" /> Las 5 del día
        </h2>
        <span className="resumen-sub">Lo esencial, en un vistazo</span>
      </div>

      <ol className="resumen-lista">
        {items.map((item, i) => (
          <li key={i} className="resumen-item">
            <span className="resumen-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              {item.slug ? (
                <Link href={`/nota/${item.slug}`} className="resumen-titulo-link">
                  <h3>{item.titulo}</h3>
                </Link>
              ) : (
                <h3>{item.titulo}</h3>
              )}
              <p>
                <span className="resumen-etiqueta">Por qué importa:</span> {item.porQueImporta}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
