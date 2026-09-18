import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

/** Fuerza a refrescar el cache de la portada (evita esperar los 30 min de REVALIDATE_RESUMEN). */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  revalidatePath("/");
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: true, path: path ?? "/", ahora: new Date().toISOString() });
}
