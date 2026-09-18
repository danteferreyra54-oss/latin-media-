/**
 * Extrae el video ID de una URL de YouTube en cualquier formato común
 * (watch?v=, youtu.be/, /embed/, /shorts/). Devuelve null si no matchea.
 */
const PATRON_YOUTUBE_ID =
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function extraerYoutubeId(url: string): string | null {
  return url.match(PATRON_YOUTUBE_ID)?.[1] ?? null;
}
