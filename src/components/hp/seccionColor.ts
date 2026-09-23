const CLAVE_SECCION: Record<string, string> = {
  "Política": "pol",
  "Economía": "eco",
  "Policiales": "pc",
  "Sociedad": "soc",
  "Espectáculos": "esp",
  "Virales": "vir",
  "Provincias": "prov",
};

/** Clase que fija el color de la sección (variables --c y --c-bg, ver globals.css). */
export function claseSeccion(seccion: string): string {
  return `s-${CLAVE_SECCION[seccion] ?? "soc"}`;
}

/** Cantidad de columnas de una grilla: tantas como elementos, hasta el máximo. */
export function columnas(cantidad: number, maximo: number): React.CSSProperties {
  return { ["--n" as string]: Math.max(1, Math.min(cantidad, maximo)) } as React.CSSProperties;
}
