import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { ArticuloHome } from "@/types/article";
import { formatHoraVariada } from "@/lib/format";

interface Props {
  titulo: string;
  href: string;
  notas: ArticuloHome[];
  columnas?: "grid4" | "grid3";
}

export default function SectionGrid({ titulo, href, notas, columnas = "grid4" }: Props) {
  return (
    <div className="sec-block">
      <div className="sec-title">
        <h2>{titulo}</h2>
        <span className="bar" />
        <Link href={href} className="more">Ver sección</Link>
      </div>
      <div className={columnas}>
        {notas.map((nota) => (
          <Link key={nota.slug} href={`/nota/${nota.slug}`} className="card">
            <PhotoPlaceholder variante={nota.imagen} className="cimg" />
            <div className="kicker">{nota.kicker}</div>
            <h3>{nota.titulo}</h3>
            <p>{nota.bajada}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
