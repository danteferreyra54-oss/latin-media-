import Link from "next/link";
import type { ProvinciaRed } from "@/types/article";
import { slugify } from "@/lib/slugify";

interface Props {
  provincias: ProvinciaRed[];
}

export default function RedNacional({ provincias }: Props) {
  return (
    <section className="red-nac">
      <div className="wrap">
        <div className="prov-grid">
          {provincias.map((provincia) =>
            provincia.activo ? (
              <Link
                key={provincia.nombre}
                href={`/provincia/${slugify(provincia.nombre)}`}
                className="prov on"
              >
                <div className="pname">{provincia.nombre}</div>
                <div className="pstate">Activo</div>
              </Link>
            ) : (
              <span key={provincia.nombre} className="prov off">
                <div className="pname">{provincia.nombre}</div>
                <div className="pstate">Pronto</div>
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
