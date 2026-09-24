import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// El sitio responde también en la dirección de Vercel. Para Google eso es contenido
// duplicado, así que las visitas se mandan al dominio oficial. /api queda afuera:
// n8n publica las notas en latinmedia-nacional.vercel.app/api/articles.
const HOST_VERCEL = "latinmedia-nacional.vercel.app";
const DOMINIO = "latinmediaok.com";

export function proxy(request: NextRequest) {
  if (request.headers.get("host") === HOST_VERCEL && !request.nextUrl.pathname.startsWith("/api/")) {
    const destino = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${DOMINIO}`);
    return NextResponse.redirect(destino, 308);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
