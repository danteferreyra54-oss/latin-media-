import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { ArticuloHome } from "@/types/article";
import { formatHoraVariada } from "@/lib/format";

interface Props {
  notas: ArticuloHome[];
}

/** Fila de notas chicas de secciones mixtas, debajo del hero. */
export default function GrillaSecundaria({ notas }: Props) {
  if (notas.length === 0) return null;

  return (
    <div className="grilla-mixta">
      {notas.map((nota) => (
        <Link key={nota.slug} href={`/nota/${nota.slug}`} className="mini-card">
          <PhotoPlaceholder variante={nota.imagen} className="mini-cimg" />
          <div className="kicker">{nota.kicker}</div>
          <h3>{nota.titulo}</h3>
        </Link>
      ))}
    </div>
  );
}
