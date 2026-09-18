import type { ArticuloHome, ItemUltimasNoticias, ProvinciaRed } from "@/types/article";

/**
 * Datos de ejemplo hardcodeados. Cuando el pipeline de n8n esté conectado
 * a POST /api/articles, estos arrays se reemplazan por la data leída
 * de la fuente real (DB / API), mapeada a ArticuloHome.
 */

export const articuloPrincipal: ArticuloHome = {
  slug: "canasta-basica-sube-tercer-mes",
  titulo:
    "El costo de la canasta básica subió por tercer mes seguido y golpea al interior del país",
  bajada:
    "El aumento fue más fuerte fuera del AMBA. En seis provincias, el gasto mensual de una familia tipo ya supera el ingreso promedio registrado.",
  cuerpo: "",
  seccion: "Economía",
  kicker: "Economía",
  autor: "Redacción Latin Media",
  fecha: "2026-08-25T14:20:00-03:00",
  fuente: "Latin Media Nacional",
  imagen: "",
};

export const ultimasNoticias: ItemUltimasNoticias[] = [
  {
    slug: "aumento-tarifas-luz-gas",
    hora: "18:42",
    titulo: "Confirman la fecha del próximo aumento de las tarifas de luz y gas",
    seccion: "Economía",
    imagen: "",
  },
  {
    slug: "prohiben-pirotecnia-cordoba",
    hora: "18:10",
    titulo: "Un municipio cordobés prohibió el uso de pirotecnia en todo su ejido",
    seccion: "Sociedad · Córdoba",
    imagen: "",
  },
  {
    slug: "detenidos-estafa-criptomonedas",
    hora: "17:55",
    titulo: "Detuvieron a tres personas por una estafa millonaria con criptomonedas",
    seccion: "Policiales",
    imagen: "",
  },
  {
    slug: "video-recital-viral",
    hora: "17:20",
    titulo: "El video del recital que se viralizó en menos de una hora",
    seccion: "Virales",
    imagen: "",
  },
  {
    slug: "actriz-anuncia-gira-teatro",
    hora: "16:48",
    titulo: "Una de las actrices más premiadas del año anunció su regreso a los escenarios",
    seccion: "Espectáculos",
    imagen: "",
  },
];

export const notasPolitica: ArticuloHome[] = [
  {
    slug: "oposicion-firmas-sesion-especial",
    titulo: "La oposición reúne firmas para forzar una sesión especial",
    bajada: "Necesitan el número justo y todavía faltan dos bloques por definir su posición.",
    cuerpo: "",
    seccion: "Política",
    kicker: "Congreso",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T12:00:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a2",
  },
  {
    slug: "gobernadores-reclamo-conjunto",
    titulo: "Tres gobernadores se reunieron para coordinar un reclamo conjunto",
    bajada: "El eje del encuentro fue la coparticipación y las obras frenadas desde diciembre.",
    cuerpo: "",
    seccion: "Política",
    kicker: "Provincias",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T11:15:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a4",
  },
  {
    slug: "causa-direccionamiento-contratos",
    titulo: "Avanza la causa por presunto direccionamiento de contratos",
    bajada: "La fiscalía pidió nuevas pericias sobre la documentación secuestrada.",
    cuerpo: "",
    seccion: "Política",
    kicker: "Judiciales",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T10:30:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a3",
  },
  {
    slug: "mapa-electoral-ano-que-viene",
    titulo: "El mapa electoral que se empieza a dibujar para el año que viene",
    bajada: "Qué provincias desdoblan, cuáles no, y por qué eso cambia el cálculo.",
    cuerpo: "",
    seccion: "Política",
    kicker: "Análisis",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T09:05:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a5",
  },
];

export const notasSociedad: ArticuloHome[] = [
  {
    slug: "nuevo-calendario-escolar",
    titulo: "Cómo impacta el nuevo calendario escolar en cada provincia",
    bajada: "Las clases arrancan y terminan en fechas distintas según la jurisdicción.",
    cuerpo: "",
    seccion: "Sociedad",
    kicker: "Educación",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T13:40:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a3",
  },
  {
    slug: "campana-vacunacion-escuelas",
    titulo: "Arranca la campaña de vacunación en escuelas de todo el país",
    bajada: "El operativo alcanza a más de dos millones de estudiantes hasta octubre.",
    cuerpo: "",
    seccion: "Sociedad",
    kicker: "Salud",
    autor: "Redacción Latin Media",
    fecha: "2026-08-25T08:50:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "",
  },
  {
    slug: "82-anos-se-recibio-posgrado",
    titulo: "Tiene 82 años, se recibió y ahora quiere hacer un posgrado",
    bajada: "Empezó la carrera hace once años y nunca faltó a un final.",
    cuerpo: "",
    seccion: "Sociedad",
    kicker: "Historias",
    autor: "Redacción Latin Media",
    fecha: "2026-08-24T19:10:00-03:00",
    fuente: "Latin Media Nacional",
    imagen: "a5",
  },
];

export const redProvincias: ProvinciaRed[] = [
  { nombre: "Córdoba", activo: true },
  { nombre: "Buenos Aires", activo: true },
  { nombre: "Santa Fe", activo: true },
  { nombre: "Mendoza", activo: true },
  { nombre: "Tucumán", activo: true },
  { nombre: "Salta", activo: true },
  { nombre: "Entre Ríos", activo: false },
  { nombre: "Neuquén", activo: true },
  { nombre: "Chaco", activo: false },
  { nombre: "Misiones", activo: false },
  { nombre: "San Juan", activo: false },
  { nombre: "Río Negro", activo: true },
];
