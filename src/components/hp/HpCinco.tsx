import Link from "next/link";
import { columnas } from "./seccionColor";
import type { ResumenDiaItem } from "@/types/article";

interface Props {
  items: ResumenDiaItem[];
}

export default function HpCinco({ items }: Props) {
  if (items.length === 0) return null;
  const visibles = items.slice(0, 5);

  return (
    <section className="hp-block hp-cinco">
      <div className="hp-block-hd">
        <span className="hp-dot" />
        <h2>Las 5 del día</h2>
        <span className="hp-sub">Lo esencial, en un vistazo</span>
      </div>
      <ol className="hp-grid" style={columnas(5, 5)}>
        {visibles.map((item, i) => (
          <li key={i} className="hp-cinco-item">
            <span className="hp-cinco-num">{String(i + 1).padStart(2, "0")}</span>
            {item.slug ? (
              <Link href={`/nota/${item.slug}`} className="hp-cinco-link">
                <h3>{item.titulo}</h3>
              </Link>
            ) : (
              <h3>{item.titulo}</h3>
            )}
            <p>{item.porQueImporta}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
