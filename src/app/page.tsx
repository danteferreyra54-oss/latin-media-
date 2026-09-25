import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HpPortadaSuperior from "@/components/hp/HpPortadaSuperior";
import HpCinco from "@/components/hp/HpCinco";
import HpVideos from "@/components/hp/HpVideos";
import HpSeccion from "@/components/hp/HpSeccion";
import { getArticuloPrincipal, getNotasPorSeccion, getNotasRecientes } from "@/lib/articles";
import { getVideosDestacados } from "@/lib/videos";
import { getResumenDelDia } from "@/lib/resumen";
import { formatHorariosEscalonados } from "@/lib/format";
import { SECCION_HREF } from "@/lib/nav";
import type { ArticuloHome, ItemUltimasNoticias } from "@/types/article";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Latin Media | Noticias de Argentina y de todas las provincias" },
  description:
    "Las noticias de todo el país en un solo lugar: política, economía, policiales y sociedad de Argentina y de cada provincia, contadas claro y sin vueltas.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "Latin Media", locale: "es_AR" },
};

const NOTAS_POR_SECCION = 4;

function aItems(notas: ArticuloHome[]): ItemUltimasNoticias[] {
  const horas = formatHorariosEscalonados(notas);
  return notas.map((nota, idx) => ({
    slug: nota.slug,
    titulo: nota.titulo,
    seccion: nota.seccion,
    hora: horas[idx],
    imagen: nota.imagen,
  }));
}

export default async function Home() {
  const principal = await getArticuloPrincipal();

  const [recientes, politica, economia, sociedad, policiales, espectaculos, videos, resumen] =
    await Promise.all([
      principal ? getNotasRecientes(principal.slug, 16) : Promise.resolve([]),
      getNotasPorSeccion("Política", NOTAS_POR_SECCION),
      getNotasPorSeccion("Economía", NOTAS_POR_SECCION),
      getNotasPorSeccion("Sociedad", NOTAS_POR_SECCION),
      getNotasPorSeccion("Policiales", NOTAS_POR_SECCION),
      getNotasPorSeccion("Espectáculos", NOTAS_POR_SECCION),
      getVideosDestacados(),
      getResumenDelDia(),
    ]);

  return (
    <>
      <SiteHeader />

      <main className="page-fade">
        <div className="wrap hp">
          <HpPortadaSuperior
            principal={principal}
            izquierda={aItems(recientes.slice(0, 6))}
            derecha={aItems(recientes.slice(6, 12))}
            centro={aItems(recientes.slice(12, 16))}
          />

          <HpCinco items={resumen} />

          <HpVideos videos={videos} />

          <HpSeccion titulo="Política" href={SECCION_HREF["Política"]} notas={politica} />
          <HpSeccion titulo="Economía" href={SECCION_HREF["Economía"]} notas={economia} />
          <HpSeccion titulo="Sociedad" href={SECCION_HREF["Sociedad"]} notas={sociedad} />
          <HpSeccion titulo="Policiales" href={SECCION_HREF["Policiales"]} notas={policiales} />
          <HpSeccion
            titulo="Espectáculos"
            href={SECCION_HREF["Espectáculos"]}
            notas={espectaculos}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
