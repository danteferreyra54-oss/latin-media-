import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import { formatHora } from "@/lib/format";
import type { ArticuloHome } from "@/types/article";

interface Props {
  articulo: ArticuloHome;
}

export default function Hero({ articulo }: Props) {
  return (
    <section className="hero">
      <article className="lead-text">
        <div className="kicker">
          {articulo.kicker} <span className="sep">|</span>{" "}
          <time>{formatHora(articulo.fecha)}</time>
        </div>
        <h1>
          <Link href={`/nota/${articulo.slug}`}>{articulo.titulo}</Link>
        </h1>
        <p className="bajada">{articulo.bajada}</p>

        <PhotoPlaceholder variante={articulo.imagen} className="lead-media" />
      </article>
    </section>
  );
}
