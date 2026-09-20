const PATRON_YOUTUBE_ID =
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function extraerYoutubeId(url: string): string | null {
  return url.match(PATRON_YOUTUBE_ID)?.[1] ?? null;
}

const PATRON_DAILYMOTION_ID =
  /(?:dailymotion\.com\/(?:video|embed\/video)|dai\.ly)\/([a-zA-Z0-9]+)/;

export function extraerDailymotionId(url: string): string | null {
  return url.match(PATRON_DAILYMOTION_ID)?.[1] ?? null;
}
