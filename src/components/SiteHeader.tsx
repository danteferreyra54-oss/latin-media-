import Link from "next/link";
import { formatFechaLarga } from "@/lib/format";
import { getCotizacionesDolar } from "@/lib/dolar";
import { getClimaPorUbicacion } from "@/lib/clima";
// import ProvinciaSelector from "./ProvinciaSelector"; // deshabilitado por ahora
import StickyNav from "./StickyNav";

export default async function SiteHeader() {
  const fecha = formatFechaLarga(new Date());
  const [{ blue, oficial }, { ciudad, temperatura }] = await Promise.all([
    getCotizacionesDolar(),
    getClimaPorUbicacion(),
  ]);

  return (
    <>

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
            {ciudad}, {temperatura}°
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
