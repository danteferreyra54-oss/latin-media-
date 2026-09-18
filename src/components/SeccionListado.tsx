import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { ArticuloHome } from "@/types/article";
import { formatHorariosEscalonados } from "@/lib/format";

interface Props {
  titulo: string;
  notas: ArticuloHome[];
}

export default function SeccionListado({ titulo, notas }: Props) {
  const horas = formatHorariosEscalonados(notas);

  return (
    <section className="sections seccion-page">
      <div className="wrap">
        <div className="sec-title seccion-page-title">
          <h1>{titulo}</h1>
          <span className="bar" />
        </div>

        {notas.length > 0 ? (
          <div className="grid3">
            {notas.map((nota, idx) => (
              <Link key={nota.slug} href={`/nota/${nota.slug}`} className="card">
                <PhotoPlaceholder variante={nota.imagen} className="cimg" />
                <div className="card-header">
                  <div className="kicker">{nota.kicker}</div>
                  <div className="hora">{horas[idx]}</div>
                </div>
                <h3>{nota.titulo}</h3>
                <p>{nota.bajada}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="seccion-vacia">Todavía no hay notas publicadas en esta sección.</p>
        )}
      </div>
    </section>
  );
}
