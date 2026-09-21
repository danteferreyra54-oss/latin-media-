import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import GrillaSecundaria from "@/components/GrillaSecundaria";
import UltimasNoticiasSidebar from "@/components/UltimasNoticiasSidebar";
import ResumenDelDia from "@/components/ResumenDelDia";
import VideoSection from "@/components/VideoSection";
import SectionGrid from "@/components/SectionGrid";
import SiteFooter from "@/components/SiteFooter";
import { getArticuloPrincipal, getNotasPorSeccion, getNotasRecientes } from "@/lib/articles";
import { getVideosDestacados } from "@/lib/videos";
import { getResumenDelDia } from "@/lib/resumen";
import { formatHorariosEscalonados } from "@/lib/format";
import { SECCION_HREF } from "@/lib/nav";

export const revalidate = 60;

const NOTAS_POR_SECCION = 6;

export default async function Home() {
  const articuloPrincipal = await getArticuloPrincipal();

  const [
    recientes,
    notasPolitica,
    notasEconomia,
    notasSociedad,
    notasPoliciales,
    notasEspectaculos,
    videos,
    resumenDelDia,
  ] = await Promise.all([
    articuloPrincipal ? getNotasRecientes(articuloPrincipal.slug, 16) : Promise.resolve([]),
    getNotasPorSeccion("Política", NOTAS_POR_SECCION),
    getNotasPorSeccion("Economía", NOTAS_POR_SECCION),
    getNotasPorSeccion("Sociedad", NOTAS_POR_SECCION),
    getNotasPorSeccion("Policiales", NOTAS_POR_SECCION),
    getNotasPorSeccion("Espectáculos", NOTAS_POR_SECCION),
    getVideosDestacados(),
    getResumenDelDia(),
  ]);

  // Un único listado de "recientes" (excluyendo la principal) se reparte en
  // dos bloques sin overlap: 5 para la grilla mixta, y el resto para el
  // sidebar de "Últimas noticias".
  const grillaMixta = recientes.slice(0, 5);
  const notasSidebar = recientes.slice(5, 15);
  const horasSidebar = formatHorariosEscalonados(notasSidebar);
  const ultimasNoticias = notasSidebar.map((nota, idx) => ({
    slug: nota.slug,
    titulo: nota.titulo,
    seccion: nota.seccion,
    hora: horasSidebar[idx],
    imagen: nota.imagen,
  }));

  return (
    <>
      <SiteHeader />

      <main className="page-fade">
        <div className="wrap portada-layout">
          <div className="portada-main">
            {articuloPrincipal && <Hero articulo={articuloPrincipal} />}

            <GrillaSecundaria notas={grillaMixta} />

            <ResumenDelDia items={resumenDelDia} />

            <div className="sections">
              <SectionGrid
                titulo="Política"
                href={SECCION_HREF["Política"]}
                notas={notasPolitica}
                columnas="grid3"
              />
              <SectionGrid
                titulo="Economía"
                href={SECCION_HREF["Economía"]}
                notas={notasEconomia}
                columnas="grid3"
              />

              <VideoSection videos={videos} />

              <SectionGrid
                titulo="Sociedad"
                href={SECCION_HREF["Sociedad"]}
                notas={notasSociedad}
                columnas="grid3"
              />
              <SectionGrid
                titulo="Policiales"
                href={SECCION_HREF["Policiales"]}
                notas={notasPoliciales}
                columnas="grid3"
              />
              <SectionGrid
                titulo="Espectáculos"
                href={SECCION_HREF["Espectáculos"]}
                notas={notasEspectaculos}
                columnas="grid3"
              />
            </div>
          </div>

          <aside className="portada-sidebar">
            <UltimasNoticiasSidebar items={ultimasNoticias} />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
