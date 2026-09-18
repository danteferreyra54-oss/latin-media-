import { createClient } from "@/utils/supabase/server";
import type { ArticuloHome, ItemUltimasNoticias, Seccion } from "@/types/article";
import { formatHora, formatHoraVariada } from "@/lib/format";

const CAMPOS_ARTICULO =
  "slug,titulo,bajada,cuerpo,seccion,kicker,autor,fecha,fuente,imagen,faqs,video_url";

function esNotaLigera(nota: ArticuloHome): boolean {
  const titulo = nota.titulo.toLowerCase();
  const bajada = nota.bajada?.toLowerCase() ?? "";

  const patronesLigeros = [
    /receta/i,
    /\bcómo\b.*\s(hacer|preparar|cocinar|lograr|conseguir)/i,
    /tips?\s+(para|de)/i,
    /trucos?\s+(para|de)/i,
    /consejo/i,
    /guía\s+de\s+(moda|belleza|cocina|estilo)/i,
    /secretos?\s+(de|para)/i,
    /errores?\s+(que|a)/i,
    /evita\s+(estos|la|el)/i,
    /\d+\s+(razones|formas|tips|consejos|secretos|trucos)/i,
    /frituras?|papas\s+fritas|comidas?\s+(chatarra|rápida)|com[eé]s\s+(frituras|papas|comida)/i,
  ];

  return patronesLigeros.some(
    (patron) => patron.test(titulo) || patron.test(bajada)
  );
}

export async function getArticuloPrincipal(): Promise<ArticuloHome | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("oculta", false)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.error("getArticuloPrincipal:", error.message);
  return data as ArticuloHome | null;
}

export async function getUltimasNoticias(limite = 8): Promise<ItemUltimasNoticias[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select("slug,titulo,seccion,fecha,imagen")
    .eq("oculta", false)
    .order("fecha", { ascending: false })
    .limit(limite);

  if (error) console.error("getUltimasNoticias:", error.message);

  return (data ?? []).map((articulo) => ({
    slug: articulo.slug,
    titulo: articulo.titulo,
    seccion: articulo.seccion,
    hora: formatHoraVariada(articulo.fecha, articulo.slug),
    imagen: articulo.imagen,
  }));
}

/** Las N notas más recientes después de una (típicamente el featured del hero). */
export async function getNotasRecientes(
  excluirSlug: string,
  limite = 3
): Promise<ArticuloHome[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("oculta", false)
    .neq("slug", excluirSlug)
    .order("fecha", { ascending: false })
    .limit(limite * 2);

  if (error) console.error("getNotasRecientes:", error.message);
  const notas = (data ?? []) as ArticuloHome[];
  const filtradas = notas.filter((nota) => !esNotaLigera(nota)).slice(0, limite);
  return filtradas.length >= limite ? filtradas : notas.slice(0, limite);
}

export async function getNotasPorSeccion(
  seccion: Seccion,
  limite = 4
): Promise<ArticuloHome[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("seccion", seccion)
    .eq("oculta", false)
    .order("fecha", { ascending: false })
    .limit(limite);

  if (error) console.error(`getNotasPorSeccion(${seccion}):`, error.message);
  return (data ?? []) as ArticuloHome[];
}

/** Notas de una sección, paginadas. Devuelve también el total real para calcular las páginas. */
export async function getNotasPorSeccionPaginado(
  seccion: Seccion,
  pagina: number,
  porPagina: number
): Promise<{ notas: ArticuloHome[]; total: number }> {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const { data, error, count } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO, { count: "exact" })
    .eq("seccion", seccion)
    .eq("oculta", false)
    .order("fecha", { ascending: false })
    .range(desde, hasta);

  if (error) console.error(`getNotasPorSeccionPaginado(${seccion}, ${pagina}):`, error.message);
  return { notas: (data ?? []) as ArticuloHome[], total: count ?? 0 };
}

export async function getNotasPorProvincia(
  nombre: string,
  limite = 24
): Promise<ArticuloHome[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("provincia", nombre)
    .eq("oculta", false)
    .order("fecha", { ascending: false })
    .limit(limite);

  if (error) console.error(`getNotasPorProvincia(${nombre}):`, error.message);
  return (data ?? []) as ArticuloHome[];
}

export async function getArticuloPorSlug(slug: string): Promise<ArticuloHome | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("slug", slug)
    .eq("oculta", false)
    .maybeSingle();

  if (error) console.error(`getArticuloPorSlug(${slug}):`, error.message);
  return data as ArticuloHome | null;
}

export async function getNotasRelacionadas(
  seccion: Seccion,
  excluirSlug: string,
  limite = 3
): Promise<ArticuloHome[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articulos")
    .select(CAMPOS_ARTICULO)
    .eq("seccion", seccion)
    .eq("oculta", false)
    .neq("slug", excluirSlug)
    .order("fecha", { ascending: false })
    .limit(limite);

  if (error) console.error(`getNotasRelacionadas(${seccion}):`, error.message);
  return (data ?? []) as ArticuloHome[];
}
