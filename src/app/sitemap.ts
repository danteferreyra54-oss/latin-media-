import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SECCION_HREF } from "@/lib/nav";

// Mapa del sitio para Google: portada, secciones y todas las notas visibles.
// Se regenera cada 10 minutos para que las notas nuevas entren solas.
export const revalidate = 600;

const BASE = "https://latinmediaok.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Supabase devuelve hasta 1000 filas por pedido: se pagina para no cortar la lista
  const notas: { slug: string; fecha: string }[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabase
      .from("articulos")
      .select("slug, fecha")
      .eq("oculta", false)
      .order("fecha", { ascending: false })
      .range(desde, desde + 999);
    if (error) {
      console.error("sitemap:", error.message);
      break;
    }
    notas.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  return [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    ...Object.values(SECCION_HREF).map((ruta) => ({
      url: BASE + ruta,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...notas.map((n) => ({
      url: `${BASE}/nota/${n.slug}`,
      lastModified: new Date(n.fecha),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
