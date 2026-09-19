import Link from "next/link";
import { formatFechaLarga } from "@/lib/format";
import { getCotizacionDolarBlue } from "@/lib/dolar";
// import ProvinciaSelector from "./ProvinciaSelector"; // deshabilitado por ahora
import StickyNav from "./StickyNav";

export default async function SiteHeader() {
  const fecha = formatFechaLarga(new Date());
  const dolar = await getCotizacionDolarBlue();

  return (
    <>
      <div className="utility">
        <div className="wrap">
          {/* Banner "Estás en <provincia> · Elegí tu provincia" deshabilitado por ahora.
          <div className="net">
            <span className="dot" />
            <ProvinciaSelector />
          </div>
          */}
          <div />
          <div className="links">
            <a href="https://www.instagram.com/latinmediaagency/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <header className="masthead">
        <div className="wrap">
          <div className="mh-left">
            {fecha}
            <br />
            Buenos Aires, 11°
            {dolar && ` · Dólar blue $${dolar.venta}`}
          </div>
          <Link href="/" className="logo">
            <div className="logo-mark">LM</div>
            <div className="logo-text">
              <div className="logo-type">Latin Media</div>
              <div className="logo-subtitulo">Actualidad política</div>
            </div>
          </Link>
          <div className="mh-right" />
        </div>
      </header>

      <StickyNav />
    </>
  );
}
