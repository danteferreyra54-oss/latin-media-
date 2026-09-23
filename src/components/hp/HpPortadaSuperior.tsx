import Link from "next/link";
import PhotoPlaceholder from "../PhotoPlaceholder";
import { formatHora, formatNombreFuente, formatTiempoLectura } from "@/lib/format";
import { claseSeccion } from "./seccionColor";
import HpTambien from "./HpTambien";
import type { ArticuloHome, ItemUltimasNoticias } from "@/types/article";

const FUENTES_SIN_NOMBRE = new Set(["desconocido", "latin media nacional", "latin media"]);

function nombreDeFuente(fuente: string | undefined): string | null {
  if (!fuente || FUENTES_SIN_NOMBRE.has(fuente.trim().toLowerCase())) return null;
  return formatNombreFuente(fuente);
}

interface Props {
  principal: ArticuloHome | null;
  izquierda: ItemUltimasNoticias[];
  derecha: ItemUltimasNoticias[];
  /** Titulares extra bajo la nota principal: solo se ven los que entran en el espacio libre. */
  centro?: ItemUltimasNoticias[];
}

/** Bloque de arriba de la portada: lista de notas, nota principal y últimas noticias con foto. */
export default function HpPortadaSuperior({ principal, izquierda, derecha, centro = [] }: Props) {
  return (
    <section className="hp-top">
      {izquierda.length > 0 && (
        <div className="hp-col-list">
          <h2 className="hp-col-hd">Más noticias</h2>
          {izquierda.map((nota) => (
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
      )}

      {principal && (
        <article className={`hp-hero ${claseSeccion(principal.seccion)}`}>
          <div className="hp-hero-kicker">
            <span className="hp-tag">{principal.kicker}</span>
            <time>{formatHora(principal.fecha)}</time>
          </div>
          <Link href={`/nota/${principal.slug}`} className="hp-hero-imglink" tabIndex={-1}>
            <PhotoPlaceholder variante={principal.imagen} className="hp-hero-img" />
          </Link>
          <h1>
            <Link href={`/nota/${principal.slug}`}>{principal.titulo}</Link>
          </h1>
          <p className="hp-hero-lead">{principal.bajada}</p>
          <div className="hp-hero-meta">
            <span>{formatTiempoLectura(principal.cuerpo)}</span>
            {nombreDeFuente(principal.fuente) && (
              <span>
                Fuente: <strong>{nombreDeFuente(principal.fuente)}</strong>
              </span>
            )}
          </div>

          <HpTambien items={centro} />
        </article>
      )}

      {derecha.length > 0 && (
        <div className="hp-col-last">
          <h2 className="hp-col-hd">Últimas noticias</h2>
          {derecha.map((nota, i) => (
            <Link
              key={nota.slug}
              href={`/nota/${nota.slug}`}
              className={`hp-la ${claseSeccion(nota.seccion)}${i === 0 ? " hp-la--destacada" : ""}`}
            >
              {i === 0 && <PhotoPlaceholder variante={nota.imagen} className="hp-la-img" />}
              <span className="hp-li-cat">{nota.seccion}</span>
              <span className="hp-la-title">{nota.titulo}</span>
              <span className="hp-li-time">{nota.hora}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
