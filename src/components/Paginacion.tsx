import Link from "next/link";

interface Props {
  base: string;
  pagina: number;
  totalPaginas: number;
}

export default function Paginacion({ base, pagina, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="paginacion" aria-label="Paginación">
      {pagina > 1 ? (
        <Link href={pagina - 1 === 1 ? base : `${base}?page=${pagina - 1}`} className="paginacion-btn">
          ← Anterior
        </Link>
      ) : (
        <span className="paginacion-btn paginacion-btn--disabled">← Anterior</span>
      )}

      <span className="paginacion-info">
        Página {pagina} de {totalPaginas}
      </span>

      {pagina < totalPaginas ? (
        <Link href={`${base}?page=${pagina + 1}`} className="paginacion-btn">
          Siguiente →
        </Link>
      ) : (
        <span className="paginacion-btn paginacion-btn--disabled">Siguiente →</span>
      )}
    </nav>
  );
}
