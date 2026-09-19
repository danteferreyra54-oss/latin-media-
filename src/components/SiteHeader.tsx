import Link from "next/link";
import { formatFechaLarga } from "@/lib/format";
import { getCotizacionesDolar } from "@/lib/dolar";
// import ProvinciaSelector from "./ProvinciaSelector"; // deshabilitado por ahora
import StickyNav from "./StickyNav";

export default async function SiteHeader() {
  const fecha = formatFechaLarga(new Date());
  const { blue, oficial } = await getCotizacionesDolar();

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

      {(blue || oficial) && (
        <div className="dolar-bar">
          <div className="wrap">
            {oficial && (
              <span>
                Dólar oficial <strong>${oficial.venta}</strong>
              </span>
            )}
            {oficial && blue && <span className="sep">·</span>}
            {blue && (
              <span>
                Dólar blue <strong>${blue.venta}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      <header className="masthead">
        <div className="wrap">
          <div className="mh-left">
            {fecha}
            <br />
            Buenos Aires, 11°
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
