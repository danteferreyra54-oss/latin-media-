import { FOOTER_SECCIONES } from "@/lib/nav";

export default function SiteFooter() {
  const anio = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <div className="f-top">
          <div>
            <div className="f-logo">
              <div className="logo-mark">LM</div>
              <div className="logo-type">Latin Media</div>
            </div>
            <p>
              Noticias de todo el país. Ocho redacciones, una sola vara: contar lo que pasa,
              claro y sin vueltas.
            </p>
          </div>
          <div className="f-col">
            <h4>Secciones</h4>
            {FOOTER_SECCIONES.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <div className="f-col">
            <h4>Formatos</h4>
            <a href="/seccion/virales">Virales</a>
            <a href="/#videos">Videos</a>
          </div>
          <div className="f-col">
            <h4>Institucional</h4>
            <a href="/quienes-somos">Quiénes somos</a>
            <a href="#">Línea editorial</a>
            <a href="#">Contacto</a>
          </div>
        </div>
        <div className="f-bottom">
          <span>© {anio} Latin Media · Todos los derechos reservados</span>
          <span>latinmedia.lat</span>
        </div>
      </div>
    </footer>
  );
}
