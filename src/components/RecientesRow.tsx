import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import { formatTiempoLectura } from "@/lib/format";
import type { ArticuloHome } from "@/types/article";

interface Props {
  notas: ArticuloHome[];
}

export default function RecientesRow({ notas }: Props) {
  if (notas.length === 0) return null;

  return (
    <section className="recientes">
      <div className="wrap">
        <div className="recientes-grid">
          {notas.map((nota) => (
            <Link key={nota.slug} href={`/nota/${nota.slug}`} className="reciente-card">
              <PhotoPlaceholder variante={nota.imagen} className="reciente-img" />
              <div className="reciente-info">
                <div className="kicker">{nota.kicker}</div>
                <h3>{nota.titulo}</h3>
                <span className="reciente-tiempo">{formatTiempoLectura(nota.cuerpo)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
