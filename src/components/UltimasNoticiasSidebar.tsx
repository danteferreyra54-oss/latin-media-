import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";
import type { ItemUltimasNoticias } from "@/types/article";

interface Props {
  items: ItemUltimasNoticias[];
}

/** Sidebar persistente de la portada, corre al lado de todo el contenido principal. */
export default function UltimasNoticiasSidebar({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="side">
      <div className="side-head">
        <span className="dot" style={{ background: "var(--red)" }} />
        <h2>Últimas noticias</h2>
      </div>
      {items.map((item) => (
        <Link key={item.slug} href={`/nota/${item.slug}`} className="side-item">
          <PhotoPlaceholder variante={item.imagen} className="side-thumb" />
          <div>
            <span className="hora">{item.hora}</span>
            <h3>{item.titulo}</h3>
            <span className="sec">{item.seccion}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
