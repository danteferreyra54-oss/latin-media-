/** Un video tomado del RSS público de un canal de YouTube. */
export interface VideoYouTube {
  videoId: string;
  titulo: string;
  canal: string;
  thumbnail: string;
  publicado: string; // ISO 8601
}
