import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeccionListado from "@/components/SeccionListado";
import { getNotasPorProvincia } from "@/lib/articles";
import { redProvincias } from "@/lib/mock-data";
import { slugify } from "@/lib/slugify";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const LIMITE = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provincia = redProvincias.find((p) => p.activo && slugify(p.nombre) === slug);
  if (!provincia) return {};

  const url = `/provincia/${slug}`;
  const titulo = `Noticias de ${provincia.nombre}`;
  const descripcion = `Últimas noticias de ${provincia.nombre}: política, economía, policiales y sociedad de la provincia, en Latin Media.`;
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

export default async function ProvinciaPage({ params }: Props) {
  const { slug } = await params;
  const provincia = redProvincias.find((p) => p.activo && slugify(p.nombre) === slug);

  if (!provincia) {
    notFound();
  }

  const notas = await getNotasPorProvincia(provincia.nombre, LIMITE);

  return (
    <>
      <SiteHeader />
      <main className="page-fade">
        <SeccionListado titulo={provincia.nombre} notas={notas} />
      </main>
      <SiteFooter />
    </>
  );
}
