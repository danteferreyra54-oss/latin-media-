import type { ImagenVariante } from "@/types/article";

interface Props {
  variante?: ImagenVariante;
  className?: string;
  children?: React.ReactNode;
}

const ES_URL = /^https?:\/\//i;

/**
 * Si `variante` es una URL real (la entrega el pipeline de n8n), muestra la
 * imagen. Si es "" o uno de los códigos a2-a5, cae al degradé placeholder.
 */
export default function PhotoPlaceholder({ variante = "", className = "", children }: Props) {
  if (ES_URL.test(variante)) {
    // Algunas fuentes entregan la URL con "&amp;" en vez de "&" (quedó
    // HTML-encodeada al scrapearla). Eso rompe query strings con auth
    // token, así que se limpia acá antes de usarla como src.
    const src = variante.replace(/&amp;/g, "&");
    return (
      <div className={`ph-img ${className}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas arbitrarias del pipeline */}
        <img src={src} alt="" loading="lazy" decoding="async" />
        {children}
      </div>
    );
  }

  const varianteClass = variante ? `ph ${variante}` : "ph";
  return <div className={`${varianteClass} ${className}`.trim()}>{children}</div>;
}
