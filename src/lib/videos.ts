import type { VideoYouTube } from "@/types/video";

const CANALES_CONFIABLES = [
  { id: "UCj6PcyLvpnIRT_2W_mwa9Aw", nombre: "TN" },
  { id: "UCvsU0EGXN7Su7MfNqcTGNHg", nombre: "Infobae" },
  { id: "UCR9120YBAqMfntqgRTKmkjQ", nombre: "A24" },
  { id: "UCba3hpU7EFBSk817y9qZkiA", nombre: "La Nación" },
];

const VIDEOS_POR_CANAL = 3;
const DURACION_MINIMA_SEGUNDOS = 60; // PT1M
const DURACION_MAXIMA_SEGUNDOS = 7 * 60; // PT7M

/**
 * Cuánto tiempo cachea Next.js la respuesta de la YouTube Data API (segundos).
 * OJO: cada refresh completo cuesta ~400 unidades de cuota (4 llamadas a
 * search.list a 100 c/u, más 1 de videos.list). Con 10.000 unidades/día
 * gratis, eso da lugar a 25 refreshes/día como máximo. Con 3h acá quedan
 * 8 refreshes/día (~3.200 unidades), dejando margen.
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
  canal: string;
  publicado: string;
}

/** "PT3M45S" -> 225 (segundos). */
function parseDuracionISO8601(duracion: string): number {
  const match = duracion.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return -1;
  const [, horas, minutos, segundos] = match;
  return (Number(horas) || 0) * 3600 + (Number(minutos) || 0) * 60 + (Number(segundos) || 0);
}

function aVideoYouTube(candidato: CandidatoVideo): VideoYouTube {
  return {
    videoId: candidato.videoId,
    titulo: candidato.titulo,
    canal: candidato.canal,
    thumbnail: `https://img.youtube.com/vi/${candidato.videoId}/mqdefault.jpg`,
    publicado: candidato.publicado,
  };
}

async function buscarPorCanal(
  apiKey: string,
  canal: { id: string; nombre: string }
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
      candidatos.push({ videoId, titulo, canal: canal.nombre, publicado });
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

/**
 * Últimos 3 videos de cada uno de los 4 canales confiables (search.list,
 * order=date), filtrados a duración entre 2 y 7 minutos (videos.list +
 * contentDetails), ordenados todos juntos por fecha de publicación
 * descendente.
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

    const filtrados = candidatos.filter((candidato) => {
      const duracion = duraciones.get(candidato.videoId);
      return (
        duracion !== undefined &&
        duracion >= DURACION_MINIMA_SEGUNDOS &&
        duracion <= DURACION_MAXIMA_SEGUNDOS
      );
    });

    return filtrados
      .sort((a, b) => new Date(b.publicado).getTime() - new Date(a.publicado).getTime())
      .map(aVideoYouTube);
  } catch (error) {
    console.error("Error trayendo videos de YouTube:", error);
    return [];
  }
}
