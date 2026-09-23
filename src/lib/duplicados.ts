const STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "que", "los", "las", "un", "una", "unos", "unas",
  "por", "con", "su", "sus", "a", "al", "del", "como", "para", "se", "es", "son",
  "fue", "fueron", "era", "eran", "quien", "quienes", "qué", "cómo", "sobre",
  "tras", "más", "muy", "esta", "este", "estos", "estas", "entre", "sin", "hay",
  "hasta", "desde", "pero", "también", "porque", "cuando", "donde", "así",
]);

/** Título normalizado -> set de palabras significativas (sin tildes/stopwords/palabras cortas). */
export function palabrasClave(titulo: string): Set<string> {
  const normalizado = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");

  return new Set(
    normalizado
      .split(/\s+/)
      .filter((palabra) => palabra.length >= 4 && !STOPWORDS.has(palabra))
  );
}

interface ArticuloBase {
  id: string;
  titulo: string;
  seccion: string;
  fecha: string;
}

const VENTANA_DIAS = 3;
const UMBRAL_SOLAPAMIENTO = 0.4;
// Con 2 palabras el cartel marcaba cualquier cosa que compartiera un lugar y un
// tema ("Mendoza" + "tormentas", "Córdoba" + "años"): 46 parejas en 5 días, casi
// todas falsas alarmas. Con 3 baja a 24 y sigue agarrando los duplicados reales.
const MIN_PALABRAS_COMPARTIDAS = 3;

/**
 * Heurística de "posible duplicado": compara títulos publicados dentro de
 * una ventana de unos días (sin importar la sección, porque el mismo hecho
 * puede quedar categorizado distinto según la fuente) y marca como posible
 * duplicado cuando comparten suficientes palabras clave. No compara texto
 * exacto (eso ya lo hace POST /api/articles) — esto agarra notas distintas
 * que cubren el mismo hecho desde otra fuente.
 */
export function detectarPosiblesDuplicados(articulos: ArticuloBase[]): Map<string, string> {
  // id de la nota -> título de la otra nota con la que se parece (para mostrarlo al pasar el mouse)
  const duplicados = new Map<string, string>();
  const items = articulos.map((a) => ({
    articulo: a,
    palabras: palabrasClave(a.titulo),
    tiempo: new Date(a.fecha).getTime(),
  }));

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      if (a.palabras.size === 0 || b.palabras.size === 0) continue;

      const diffDias = Math.abs(a.tiempo - b.tiempo) / 86_400_000;
      if (diffDias > VENTANA_DIAS) continue;

      const compartidas = [...a.palabras].filter((p) => b.palabras.has(p)).length;
      const minSize = Math.min(a.palabras.size, b.palabras.size);

      if (compartidas >= MIN_PALABRAS_COMPARTIDAS && compartidas / minSize >= UMBRAL_SOLAPAMIENTO) {
        if (!duplicados.has(a.articulo.id)) duplicados.set(a.articulo.id, b.articulo.titulo);
        if (!duplicados.has(b.articulo.id)) duplicados.set(b.articulo.id, a.articulo.titulo);
      }
    }
  }

  return duplicados;
}
