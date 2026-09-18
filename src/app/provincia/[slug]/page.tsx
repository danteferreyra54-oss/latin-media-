import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeccionListado from "@/components/SeccionListado";
import { getNotasPorProvincia } from "@/lib/articles";
import { redProvincias } from "@/lib/mock-data";
import { slugify } from "@/lib/slugify";

interface Props {
  params: Promise<{ slug: string }>;
}

const LIMITE = 24;

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
