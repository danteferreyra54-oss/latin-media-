export interface NavItem {
  label: string;
  href: string;
  hot?: boolean;
}

/** Secciones del medio. No incluye Deportes: Latin Media Nacional no cubre deportes. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Portada", href: "/" },
  { label: "Política", href: "/seccion/politica" },
  { label: "Economía", href: "/seccion/economia" },
  { label: "Policiales", href: "/seccion/policiales" },
  { label: "Sociedad", href: "/seccion/sociedad" },
  { label: "Espectáculos", href: "/seccion/espectaculos" },
  { label: "Virales", href: "/seccion/virales", hot: true },
  { label: "Provincias", href: "/provincias" },
];

/** href de la página de sección para cada valor de Seccion (ver src/types/article.ts). */
export const SECCION_HREF: Record<string, string> = {
  Política: "/seccion/politica",
  Economía: "/seccion/economia",
  Policiales: "/seccion/policiales",
  Sociedad: "/seccion/sociedad",
  Espectáculos: "/seccion/espectaculos",
  Virales: "/seccion/virales",
  Provincias: "/provincias",
};

/** Inverso de SECCION_HREF para /seccion/[slug]: slug de la URL -> valor de Seccion. */
export const SLUG_A_SECCION: Record<string, string> = {
  politica: "Política",
  economia: "Economía",
  policiales: "Policiales",
  sociedad: "Sociedad",
  espectaculos: "Espectáculos",
  virales: "Virales",
};

export const FOOTER_SECCIONES: NavItem[] = [
  { label: "Política", href: "/seccion/politica" },
  { label: "Economía", href: "/seccion/economia" },
  { label: "Policiales", href: "/seccion/policiales" },
  { label: "Sociedad", href: "/seccion/sociedad" },
  { label: "Espectáculos", href: "/seccion/espectaculos" },
];
