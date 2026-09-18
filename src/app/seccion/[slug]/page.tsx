import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeccionListado from "@/components/SeccionListado";
import Paginacion from "@/components/Paginacion";
import { getNotasPorSeccionPaginado } from "@/lib/articles";
import { SLUG_A_SECCION } from "@/lib/nav";
import type { Seccion } from "@/types/article";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const POR_PAGINA = 24;

export default async function SeccionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const seccion = SLUG_A_SECCION[slug] as Seccion | undefined;

  if (!seccion) {
    notFound();
  }

  const pagina = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { notas, total } = await getNotasPorSeccionPaginado(seccion, pagina, POR_PAGINA);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <SiteHeader />
      <main className="page-fade">
        <SeccionListado titulo={seccion} notas={notas} />
        <Paginacion base={`/seccion/${slug}`} pagina={pagina} totalPaginas={totalPaginas} />
      </main>
      <SiteFooter />
    </>
  );
}
