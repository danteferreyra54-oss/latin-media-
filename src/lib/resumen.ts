import type { ResumenDiaItem } from "@/types/article";

/** Shape cruda de un ítem tal como lo guarda el pipeline en la columna jsonb `items`. */
interface ResumenDiaItemCrudo {
  titulo: string;
  por_que_importa: string;
  slug?: string;
}

const DIACRITICOS = new RegExp("[̀-ͯ]", "g");

/** Normaliza para matchear por título tolerando tildes/mayúsculas/espacios/puntuación distinta. */
function normalizarTitulo(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Cuánto tiempo cachea Next.js la respuesta (segundos). */
export const REVALIDATE_RESUMEN = 1800; // 30 min

function headersSupabase(apiKey: string) {
  return { apikey: apiKey, Authorization: `Bearer ${apiKey}` };
}

/**
 * `resumen_diario` no guarda el slug de la nota que resume, pero sus
 * títulos coinciden exactamente con los de `articulos` (el pipeline los
 * deriva de ahí). Traemos slug+título de todos los artículos y matcheamos
 * por título exacto para poder linkear cada ítem a su nota real.
 */
async function getSlugsPorTitulo(
  supabaseUrl: string,
  apiKey: string
): Promise<Map<string, string>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/articulos?select=slug,titulo`, {
    headers: headersSupabase(apiKey),
    next: { revalidate: REVALIDATE_RESUMEN },
  });
  if (!res.ok) return new Map();

  const filas = (await res.json()) as { slug: string; titulo: string }[];
  return new Map(filas.map((fila) => [normalizarTitulo(fila.titulo), fila.slug]));
}

/**
 * Trae "Las 5 del día" desde la tabla `resumen_diario` de Supabase: la fila
 * más reciente por `fecha`, columna `items` (jsonb). Usa la publishable key
 * vía REST directo en vez de supabase-js: la tabla ya tiene policy de
 * lectura pública, no hace falta bypassear RLS con la service role.
 */
export async function getResumenDelDia(): Promise<ResumenDiaItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !apiKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
    return [];
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/resumen_diario?select=items&order=fecha.desc&limit=1`,
      {
        headers: headersSupabase(apiKey),
        next: { revalidate: REVALIDATE_RESUMEN },
      }
    );

    if (!res.ok) {
      throw new Error(`resumen_diario respondió ${res.status}`);
    }

    const filas = (await res.json()) as { items: ResumenDiaItemCrudo[] }[];
    const items = filas[0]?.items ?? [];
    if (items.length === 0) return [];

    // Si algún ítem ya trae su slug real (formato nuevo), no hace falta
    // matchear por título — solo se buscan los slugs para los que no lo
    // traen (formato viejo / compatibilidad).
    const necesitaMatchPorTitulo = items.some((item) => !item.slug);
    const slugsPorTitulo = necesitaMatchPorTitulo
      ? await getSlugsPorTitulo(supabaseUrl, apiKey)
      : new Map<string, string>();

    return items.map((item) => ({
      titulo: item.titulo,
      porQueImporta: item.por_que_importa,
      slug: item.slug || slugsPorTitulo.get(normalizarTitulo(item.titulo)),
    }));
  } catch (error) {
    console.error("Error trayendo Las 5 del día:", error);
    return [];
  }
}
