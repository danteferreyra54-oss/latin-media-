import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeccionListado from "@/components/SeccionListado";
import Paginacion from "@/components/Paginacion";
import { getNotasPorSeccionPaginado } from "@/lib/articles";
import { SLUG_A_SECCION } from "@/lib/nav";
import type { Seccion } from "@/types/article";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const POR_PAGINA = 24;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const seccion = SLUG_A_SECCION[slug];
  if (!seccion) return {};

  const pagina = Math.max(1, parseInt(page ?? "1", 10) || 1);
  // cada página del listado es su propia URL canónica (la 2 no es copia de la 1)
  const url = `/seccion/${slug}${pagina > 1 ? `?page=${pagina}` : ""}`;
  const titulo = `Noticias de ${seccion}${pagina > 1 ? ` (página ${pagina})` : ""}`;
  const descripcion = `Últimas noticias de ${seccion.toLowerCase()} de Argentina y de las provincias, actualizadas todo el día en Latin Media.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "Latin Media",
      locale: "es_AR",
      title: titulo,
      description: descripcion,
      images: ["/opengraph-image"],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: ["/opengraph-image"] },
  };
}

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
