import { createClient } from "@supabase/supabase-js";

// Sitemap de Google News: solo las notas de las últimas 48 horas (es lo que Google News
// admite). Next.js no trae un tipo nativo para este formato, así que se arma el XML a mano.
// Se regenera cada 10 minutos para que las notas nuevas lleguen rápido a Google.
export const revalidate = 600;

const BASE = "https://latinmediaok.com";

function escaparXml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const desde = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("articulos")
    .select("slug, titulo, fecha")
    .eq("oculta", false)
    .gte("fecha", desde)
    .order("fecha", { ascending: false })
    .limit(1000); // máximo que admite Google News por sitemap
  if (error) console.error("news-sitemap:", error.message);

  const urls = (data ?? [])
    .map(
      (n) => `  <url>
    <loc>${BASE}/nota/${escaparXml(n.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Latin Media</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${new Date(n.fecha).toISOString()}</news:publication_date>
      <news:title>${escaparXml(n.titulo)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
