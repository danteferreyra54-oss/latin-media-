import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: "Latin Media es un medio digital argentino con redacciones en todo el país: contamos lo que pasa, claro y sin vueltas.",
  alternates: { canonical: "/quienes-somos" },
};

export default function QuienesSomosPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-fade">
        <div className="wrap seccion-page">
          <div className="seccion-page-title institucional-title">
            <h1>Quiénes somos</h1>
            <span className="institucional-bar" />
          </div>
          <div className="institucional-layout">
            <div className="nota-cuerpo institucional-cuerpo" style={{ maxWidth: "760px" }}>
              <p>
                <strong>Latin Media</strong> nació con una idea simple: que las noticias de cada
                provincia merezcan el mismo lugar que las de Buenos Aires.
              </p>
              <p>
                Somos un medio digital de <strong>cobertura nacional</strong>. Cubrimos política,
                economía, policiales, sociedad y espectáculos desde las{" "}
                <strong>24 provincias argentinas</strong>, con fuentes en cada región y un
                criterio periodístico que <strong>no distingue entre capital e interior</strong>.
              </p>
              <p>
                Creemos que <strong>estar informado es un derecho, no un privilegio</strong> de
                los que viven cerca de los grandes medios. Por eso apostamos por una{" "}
                <strong>cobertura federal de verdad</strong>, la que muestra lo que pasa en Salta,
                en Mendoza, en Santa Fe y en cada rincón del país con la misma atención que le
                daríamos a cualquier noticia de la Capital.
              </p>
              <p>
                <strong>Nuestro compromiso es con el lector.</strong> Con la información clara, el
                lenguaje directo y la actualización constante. En <strong>Latin Media</strong>,{" "}
                <strong>si es noticia, lo cubrimos</strong>.
              </p>
            </div>

            <aside className="institucional-datos">
              <div className="side-head">
                <span className="dot" style={{ background: "var(--red)" }} />
                <h2>En números</h2>
              </div>
              <div className="dato-item">
                <span className="dato-num">24</span>
                <span className="dato-label">provincias cubiertas</span>
              </div>
              <div className="dato-item">
                <span className="dato-num">5</span>
                <span className="dato-label">
                  secciones: Política, Economía, Policiales, Sociedad y Espectáculos
                </span>
              </div>
              <div className="dato-item">
                <span className="dato-num">24/7</span>
                <span className="dato-label">actualización constante</span>
              </div>
              <a
                href="https://www.instagram.com/latinmediaagency/"
                target="_blank"
                rel="noopener noreferrer"
                className="dato-link"
              >
                Seguinos en Instagram →
              </a>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
