import { NextResponse } from "next/server";
import { getResumenDelDia } from "@/lib/resumen";

// Debe ser un literal estático: Next no acepta un valor importado acá.
// Mantener en sync con REVALIDATE_RESUMEN de @/lib/resumen.
export const revalidate = 1800;

export async function GET() {
  const items = await getResumenDelDia();
  return NextResponse.json(items);
}
