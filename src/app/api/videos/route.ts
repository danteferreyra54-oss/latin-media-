import { NextResponse } from "next/server";
import { getVideosDestacados } from "@/lib/videos";

// Debe ser un literal estático: Next no acepta un valor importado acá.
// Mantener en sync con REVALIDATE_VIDEOS de @/lib/videos.
export const revalidate = 10800;

export async function GET() {
  const videos = await getVideosDestacados();
  return NextResponse.json({ videos });
}
