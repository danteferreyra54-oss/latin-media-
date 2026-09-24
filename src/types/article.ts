/**
 * Forma de artículo tal como lo entrega/entregará el pipeline de n8n
 * via POST /api/articles. Los campos de acá deben mantenerse en
 * sincronía con ese contrato.
 */
export type Seccion =
  | "Política"
  | "Economía"
  | "Policiales"
  | "Sociedad"
  | "Espectáculos"
  | "Virales"
  | "Provincias";

export interface Faq {
  pregunta: string;
  respuesta: string;
}

export interface ArticuloAPI {
  titulo: string;
  bajada: string;
  cuerpo: string;
  seccion: Seccion;
  autor: string;
  fecha: string; // ISO 8601
  fuente: string;
  faqs?: Faq[] | null;
  video_url?: string | null;
  epigrafe?: string | null; // texto debajo de la foto de portada (ej: "Foto: X @luispetri")
}

/**
 * "" o "a2"-"a5": variante de gradiente placeholder (.ph / .ph.aN del mockup).
 * Una URL http(s): imagen real entregada por el pipeline de n8n.
 */
export type ImagenVariante = "" | "a2" | "a3" | "a4" | "a5" | (string & {});

/**
 * Artículo enriquecido para presentación en home: además de los campos
 * de la API, agrega lo que la UI necesita (slug, imagen, kicker, etc).
 * Cuando conectemos datos reales, este es el shape que arma el mapper
 * entre ArticuloAPI -> ArticuloHome.
 */
export interface ArticuloHome extends ArticuloAPI {
  slug: string;
  kicker: string; // texto corto mostrado sobre el título (puede diferir de `seccion`)
  imagen: ImagenVariante;
}

export interface ItemUltimasNoticias {
  slug: string;
  hora: string;
  titulo: string;
  seccion: string;
  imagen: ImagenVariante;
}

export interface ProvinciaRed {
  nombre: string;
  activo: boolean;
}

/**
 * Un ítem del widget "Las 5 del día" (formato Axios: título corto +
 * una línea de "por qué importa"). Sale de la tabla `resumen_diario` en
 * Supabase. Si el pipeline ya guarda el `slug` real de la nota junto al
 * ítem, se usa directo. Si no (formato viejo, solo `titulo`), lib/resumen.ts
 * intenta matchear por título normalizado contra `articulos`. Si no hay
 * match de ninguna forma, queda undefined y el ítem se renderiza sin link.
 */
export interface ResumenDiaItem {
  titulo: string;
  porQueImporta: string;
  slug?: string;
}
