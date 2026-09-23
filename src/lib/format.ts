const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

const HORA = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

/** "Martes 25 de agosto de 2026" */
export function formatFechaLarga(date: Date): string {
  const partes = FECHA_LARGA.format(date);
  return partes.charAt(0).toUpperCase() + partes.slice(1);
}

export function formatHora(iso: string): string {
  return HORA.format(new Date(iso));
}

const PALABRAS_POR_MINUTO = 200;

/** "3 min de lectura" a partir del cuerpo de la nota (~200 palabras/min). */
export function formatTiempoLectura(cuerpo: string): string {
  const palabras = cuerpo.trim().split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
  return `${minutos} min de lectura`;
}

/**
 * El pipeline separa bloques (párrafos, headers "###", etc.) con espacios
 * dobles en vez de saltos de línea reales. Markdown necesita una línea en
 * blanco entre bloques para reconocer un heading como tal (si no, "###"
 * termina renderizado como texto literal en vez de <h3>), así que esto
 * normaliza cualquier corrida de 2+ espacios/saltos a "\n\n" antes de
 * pasarle el texto a react-markdown.
 */
export function normalizarMarkdown(cuerpo: string): string {
  return cuerpo.replace(/\s{2,}/g, "\n\n").trim();
}

/** "https://www.infobae.com/politica/..." -> "Infobae". Si no es una URL, devuelve el valor tal cual. */
export function formatNombreFuente(fuente: string): string {
  try {
    const host = new URL(fuente).hostname.replace(/^www\./, "");
    const nombre = host.split(".")[0];
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  } catch {
    return fuente;
  }
}

/** "Hace 40 minutos" a partir de una fecha ISO, relativa a ahora. */
export function formatTiempoRelativo(iso: string, ahora: Date = new Date()): string {
  const diffMs = ahora.getTime() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Hace instantes";
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;

  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras === 1 ? "" : "s"}`;

  const diffDias = Math.round(diffHoras / 24);
  return `Hace ${diffDias} día${diffDias === 1 ? "" : "s"}`;
}

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

/** Pseudo-random determinístico [0, 1) a partir de un hash entero. */
function seededFraction(hash: number): number {
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/** Genera una hora variada basada en el slug para consistencia. ±20 minutos aleatoriamente. */
export function formatHoraVariada(iso: string, slug: string): string {
  const fecha = new Date(iso);
  const seeded = seededFraction(hashSlug(slug));
  const variacion = Math.floor(seeded * 41) - 20;

  const partes = HORA.format(fecha).split(":");
  let horas = parseInt(partes[0], 10);
  let minutos = parseInt(partes[1], 10) + variacion;

  if (minutos < 0) {
    minutos += 60;
    horas -= 1;
  } else if (minutos >= 60) {
    minutos -= 60;
    horas += 1;
  }
  horas = ((horas % 24) + 24) % 24;

  const horaStr = horas.toString().padStart(2, "0");
  const minStr = minutos.toString().padStart(2, "0");
  return `${horaStr}:${minStr}`;
}

/**
 * Genera horas para una lista de notas YA ordenadas por fecha descendente,
 * de forma que el resultado también quede estrictamente descendente:
 * ancla en la hora real de la primera nota y va restando entre 1 y 20
 * minutos (determinístico por slug) para cada nota siguiente.
 */
export function formatHorariosEscalonados(
  notas: { slug: string; fecha: string }[]
): string[] {
  if (notas.length === 0) return [];

  const partesIniciales = HORA.format(new Date(notas[0].fecha)).split(":");
  let minutosTotales =
    parseInt(partesIniciales[0], 10) * 60 + parseInt(partesIniciales[1], 10);

  const resultado: string[] = [];

  for (let i = 0; i < notas.length; i++) {
    if (i > 0) {
      const seeded = seededFraction(hashSlug(notas[i].slug));
      const gap = 1 + Math.floor(seeded * 20); // 1 a 20 minutos
      minutosTotales -= gap;
    }

    let h = Math.floor(minutosTotales / 60) % 24;
    let m = minutosTotales % 60;
    if (h < 0) h += 24;
    if (m < 0) m += 60;

    resultado.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }

  return resultado;
}

/** Identidad de una foto, sin dominio, medidas ni firmas: sirve para saber si dos URLs son la misma foto. */
export function claveFoto(url: string): string {
  let s = url || "";
  try {
    s = decodeURIComponent(s);
  } catch {
    // URL con % mal escrito: se usa tal cual
  }
  const arc = s.match(/[A-Z0-9]{26}/);
  if (arc) return arc[0];
  return s
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(
      (seg) =>
        seg &&
        !/^\d+x\d+(?::\d+x\d+)?$/.test(seg) &&
        !/^[0-9a-f]{32}$/i.test(seg) &&
        !/^(smart|crop|fit|scale|resize|thumb|thumbs|large|medium|small|original|uploads)$/i.test(seg)
    )
    .join("/")
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp|gif|avif|jfif)$/i, "")
    .replace(/-\d{2,4}x\d{2,4}$/, "")
    .replace(/[-_](thumb|small|medium|large|min|mini|xl|sm|md|lg|scaled)$/, "");
}
