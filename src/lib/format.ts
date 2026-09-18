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

/** Genera una hora variada basada en el slug para consistencia. ±20 minutos aleatoriamente. */
export function formatHoraVariada(iso: string, slugOrIndex: string | number): string {
  const fecha = new Date(iso);

  let hash = 0;
  if (typeof slugOrIndex === "number") {
    hash = slugOrIndex * 73;
  } else {
    for (let i = 0; i < slugOrIndex.length; i++) {
      hash = ((hash << 5) - hash) + slugOrIndex.charCodeAt(i);
      hash = hash & hash;
    }
  }
  const x = Math.sin(hash) * 10000;
  const seeded = x - Math.floor(x);
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

  const horaStr = horas.toString().padStart(2, "0");
  const minStr = minutos.toString().padStart(2, "0");
  return `${horaStr}:${minStr}`;
}
