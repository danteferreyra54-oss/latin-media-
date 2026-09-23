import Link from "next/link";
import PhotoPlaceholder from "../PhotoPlaceholder";
import { formatHora } from "@/lib/format";
import { claseSeccion } from "./seccionColor";
import type { ArticuloHome } from "@/types/article";

interface Props {
  titulo: string;
  href: string;
  notas: ArticuloHome[];
}

export default function HpSeccion({ titulo, href, notas }: Props) {
  if (notas.length === 0) return null;

  return (
    <section className={`hp-block hp-sec ${claseSeccion(titulo)}`}>
      <div className="hp-block-hd">
        <h2>{titulo}</h2>
        <span className="hp-rule" />
        <Link href={href} className="hp-more">
          Ver sección →
        </Link>
      </div>
      <div className="hp-grid">
        {notas.map((nota) => (
          <Link key={nota.slug} href={`/nota/${nota.slug}`} className="hp-card">
            <PhotoPlaceholder variante={nota.imagen} className="hp-card-img" />
            <span className="hp-card-cat">{nota.kicker}</span>
            <h3>{nota.titulo}</h3>
            <p>{nota.bajada}</p>
            <time>{formatHora(nota.fecha)}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}
