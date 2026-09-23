import type { VideoYouTube } from "@/types/video";
import { palabrasClave } from "@/lib/duplicados";

interface Canal {
  id: string;
  nombre: string;
  duracionMin: number;
  duracionMax: number;
  excluirTitulo?: RegExp;
}

const CANALES_CONFIABLES: Canal[] = [
  { id: "UCj6PcyLvpnIRT_2W_mwa9Aw", nombre: "TN", duracionMin: 60, duracionMax: 7 * 60 },
  { id: "UCvsU0EGXN7Su7MfNqcTGNHg", nombre: "Infobae", duracionMin: 60, duracionMax: 7 * 60 },
  { id: "UCR9120YBAqMfntqgRTKmkjQ", nombre: "A24", duracionMin: 60, duracionMax: 7 * 60 },
  { id: "UCba3hpU7EFBSk817y9qZkiA", nombre: "La Nación", duracionMin: 60, duracionMax: 7 * 60 },
  {
    id: "UChxGASjdNEYHhVKpl667Huw",
    nombre: "Telefe Noticias",
    duracionMin: 0,
    duracionMax: 3 * 60,
    excluirTitulo: /gran hermano/i,
  },
];

const VIDEOS_POR_CANAL = 3;

/**
 * Cuánto tiempo cachea Next.js la respuesta de la YouTube Data API (segundos).
 * OJO: cada refresh completo cuesta ~500 unidades de cuota (5 llamadas a
 * search.list a 100 c/u, más 1 de videos.list). Con 10.000 unidades/día
 * gratis, eso da lugar a 20 refreshes/día como máximo. Con 3h acá quedan
 * 8 refreshes/día (~4.000 unidades), dejando margen.
 */
export const REVALIDATE_VIDEOS = 10800; // 3 h

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

interface SearchListResponse {
  items?: {
    id?: { videoId?: string };
    snippet?: { title?: string; publishedAt?: string };
  }[];
}

interface VideosListResponse {
  items?: { id: string; contentDetails?: { duration?: string } }[];
}

interface CandidatoVideo {
  videoId: string;
  titulo: string;
  canal: Canal;
  publicado: string;
}

/** "PT3M45S" -> 225 (segundos). */
function parseDuracionISO8601(duracion: string): number {
  const match = duracion.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return -1;
  const [, horas, minutos, segundos] = match;
  return (Number(horas) || 0) * 3600 + (Number(minutos) || 0) * 60 + (Number(segundos) || 0);
}

/** La API de YouTube entrega los títulos con entidades HTML (&quot;, &amp;, &#39;...). */
function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function aVideoYouTube(candidato: CandidatoVideo): VideoYouTube {
  return {
    videoId: candidato.videoId,
    titulo: decodificarEntidades(candidato.titulo),
    canal: candidato.canal.nombre,
    thumbnail: `https://img.youtube.com/vi/${candidato.videoId}/mqdefault.jpg`,
    publicado: candidato.publicado,
  };
}

async function buscarPorCanal(
  apiKey: string,
  canal: Canal
): Promise<CandidatoVideo[]> {
  const url =
    `${YOUTUBE_API}/search?part=snippet&channelId=${canal.id}&type=video` +
    `&order=date&maxResults=${VIDEOS_POR_CANAL}&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: REVALIDATE_VIDEOS } });
  if (!res.ok) throw new Error(`search.list (${canal.nombre}) respondió ${res.status}`);

  const data = (await res.json()) as SearchListResponse;
  const candidatos: CandidatoVideo[] = [];
  for (const item of data.items ?? []) {
    const videoId = item.id?.videoId;
    const titulo = item.snippet?.title;
    const publicado = item.snippet?.publishedAt;
    if (videoId && titulo && publicado) {
      candidatos.push({ videoId, titulo, canal, publicado });
    }
  }
  return candidatos;
}

async function getDuraciones(apiKey: string, videoIds: string[]): Promise<Map<string, number>> {
  if (videoIds.length === 0) return new Map();

  const res = await fetch(
    `${YOUTUBE_API}/videos?part=contentDetails&id=${videoIds.join(",")}&key=${apiKey}`,
    { next: { revalidate: REVALIDATE_VIDEOS } }
  );
  if (!res.ok) throw new Error(`videos.list respondió ${res.status}`);

  const data = (await res.json()) as VideosListResponse;
  const duraciones = new Map<string, number>();
  for (const item of data.items ?? []) {
    duraciones.set(item.id, parseDuracionISO8601(item.contentDetails?.duration ?? ""));
  }
  return duraciones;
}

// Más agresivo que el detector de notas: preferimos perder un video a mostrar dos del mismo tema.
const MIN_PALABRAS_COMPARTIDAS_VIDEO = 2;

function palabrasDeVideo(titulo: string): Set<string> {
  return palabrasClave(decodificarEntidades(titulo).replace(/#\S+/g, " "));
}

/** Entre videos del mismo tema se queda con el más nuevo (la lista ya viene ordenada por fecha). */
function sinTemasRepetidos(candidatos: CandidatoVideo[]): CandidatoVideo[] {
  const elegidos: { candidato: CandidatoVideo; palabras: Set<string> }[] = [];
  for (const candidato of candidatos) {
    const palabras = palabrasDeVideo(candidato.titulo);
    const repetido = elegidos.some(
      (e) => [...palabras].filter((p) => e.palabras.has(p)).length >= MIN_PALABRAS_COMPARTIDAS_VIDEO
    );
    if (!repetido) elegidos.push({ candidato, palabras });
  }
  return elegidos.map((e) => e.candidato);
}

/**
 * Últimos 3 videos de cada canal confiable (search.list, order=date),
 * filtrados según las reglas de duración y título de cada canal, ordenados
 * todos juntos por fecha de publicación descendente.
 */
export async function getVideosDestacados(): Promise<VideoYouTube[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("Falta YOUTUBE_API_KEY: no se pueden traer videos de YouTube.");
    return [];
  }

  try {
    const resultadosPorCanal = await Promise.allSettled(
      CANALES_CONFIABLES.map((canal) => buscarPorCanal(apiKey, canal))
    );

    const candidatos = resultadosPorCanal
      .filter((r): r is PromiseFulfilledResult<CandidatoVideo[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (candidatos.length === 0) return [];

    const duraciones = await getDuraciones(
      apiKey,
      candidatos.map((c) => c.videoId)
    );

    const filtrados = candidatos.filter(({ videoId, titulo, canal }) => {
      const duracion = duraciones.get(videoId);
      if (duracion === undefined || duracion < canal.duracionMin || duracion > canal.duracionMax) {
        return false;
      }
      return !canal.excluirTitulo?.test(decodificarEntidades(titulo));
    });

    const ordenados = filtrados.sort(
      (a, b) => new Date(b.publicado).getTime() - new Date(a.publicado).getTime()
    );

    return sinTemasRepetidos(ordenados).map(aVideoYouTube);
  } catch (error) {
    console.error("Error trayendo videos de YouTube:", error);
    return [];
  }
}
