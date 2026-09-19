import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/slugify";
import type { Faq, ImagenVariante, Seccion } from "@/types/article";

const SECCIONES: Seccion[] = [
  "Política",
  "Economía",
  "Policiales",
  "Sociedad",
  "Espectáculos",
  "Virales",
  "Provincias",
];



interface ArticuloBody {
  titulo?: unknown;
  bajada?: unknown;
  cuerpo?: unknown;
  seccion?: unknown;
  autor?: unknown;
  fecha?: unknown;
  fuente?: unknown;
  fuente_original?: unknown;
  kicker?: unknown;
  imagen?: unknown;
  faqs?: unknown;
  video_url?: unknown;
  slug?: unknown;
  provincia?: unknown;
  topic_key?: unknown;
}

function esFaqValida(item: unknown): item is Faq {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as Record<string, unknown>).pregunta === "string" &&
    typeof (item as Record<string, unknown>).respuesta === "string"
  );
}

function validar(body: ArticuloBody): string | null {
  if (typeof body.titulo !== "string" || !body.titulo.trim()) return "titulo es requerido";
  if (typeof body.bajada !== "string" || !body.bajada.trim()) return "bajada es requerida";
  if (typeof body.cuerpo !== "string") return "cuerpo debe ser un string";
  if (typeof body.seccion !== "string" || !SECCIONES.includes(body.seccion as Seccion)) {
    return `seccion debe ser una de: ${SECCIONES.join(", ")}`;
  }
  if (typeof body.autor !== "string" || !body.autor.trim()) return "autor es requerido";
  if (typeof body.fecha !== "string" || Number.isNaN(Date.parse(body.fecha))) {
    return "fecha debe ser un string ISO 8601 válido";
  }
  if (typeof body.fuente !== "string" || !body.fuente.trim()) return "fuente es requerida";
  if (body.kicker !== undefined && typeof body.kicker !== "string") {
    return "kicker debe ser un string";
  }
 if (body.imagen !== undefined && typeof body.imagen !== "string") {
  return "imagen debe ser un string o null";
}
  if (
    body.faqs !== undefined &&
    body.faqs !== null &&
    (!Array.isArray(body.faqs) || !body.faqs.every(esFaqValida))
  ) {
    return "faqs debe ser un array de objetos { pregunta, respuesta }";
  }
  if (
    body.video_url !== undefined &&
    body.video_url !== null &&
    typeof body.video_url !== "string"
  ) {
    return "video_url debe ser un string o null";
  }
  if (body.slug !== undefined && typeof body.slug !== "string") {
    return "slug debe ser un string";
  }
  if (
    body.provincia !== undefined &&
    body.provincia !== null &&
    typeof body.provincia !== "string"
  ) {
    return "provincia debe ser un string o null";
  }
  if (
    body.fuente_original !== undefined &&
    body.fuente_original !== null &&
    typeof body.fuente_original !== "string"
  ) {
    return "fuente_original debe ser un string o null";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.ARTICLES_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: ArticuloBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body debe ser JSON válido" }, { status: 400 });
  }

  const error = validar(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const titulo = (body.titulo as string).trim();
  const seccion = body.seccion as Seccion;
  const slugPropuesto = (body.slug as string | undefined)?.trim();
  const slugBase = slugPropuesto ? slugify(slugPropuesto) : slugify(titulo);

  const supabase = createAdminClient();
  const fuente = (body.fuente as string).trim();

  // Evita duplicados: si ya existe una nota con el mismo título (mismo
  // slug base), no crear una copia con sufijo "-2" — el pipeline puede
  // reintentar/disparar dos veces la misma noticia.
  const { data: existentePorSlug } = await supabase
    .from("articulos")
    .select("slug")
    .eq("slug", slugBase)
    .maybeSingle();

  if (existentePorSlug) {
    return NextResponse.json(
      { error: "Ya existe una nota con ese título", slug: existentePorSlug.slug },
      { status: 409 }
    );
  }

  // Evita duplicados por fuente: si el pipeline reprocesa la misma noticia
  // original, la IA puede generar un título distinto cada vez y el chequeo
  // de arriba no lo detecta. `fuente` puede ser una URL http(s) o un token
  // opaco (p. ej. Google News), así que en vez de exigir formato de URL
  // solo se descartan los valores genéricos conocidos (no identifican una
  // noticia puntual) y los strings muy cortos.
  const FUENTES_GENERICAS = new Set(["Desconocido", "Latin Media Nacional", "Latin Media"]);
  if (fuente.length >= 15 && !FUENTES_GENERICAS.has(fuente)) {
    const { data: existentePorFuente } = await supabase
      .from("articulos")
      .select("slug")
      .eq("fuente", fuente)
      .maybeSingle();

    if (existentePorFuente) {
      return NextResponse.json(
        { error: "Ya existe una nota con esa misma fuente", slug: existentePorFuente.slug },
        { status: 409 }
      );
    }
  }

  const { data, error: dbError } = await supabase
    .from("articulos")
    .insert({
      slug: slugBase,
      titulo,
      bajada: (body.bajada as string).trim(),
      topic_key: (body.topic_key as string | null | undefined) ?? null,
      cuerpo: body.cuerpo as string,
      seccion,
      kicker: (body.kicker as string | undefined)?.trim() || seccion,
      autor: (body.autor as string).trim(),
      fecha: body.fecha as string,
      fuente,
      fuente_original: (body.fuente_original as string | null | undefined) ?? null,
      imagen: (body.imagen as ImagenVariante | undefined) ?? "",
      faqs: (body.faqs as Faq[] | undefined) ?? null,
      video_url: ((body.video_url as string | undefined) ?? "").trim() || null,
      provincia: (body.provincia as string | null | undefined) ?? null,
    })
    .select()
    .single();

  if (dbError) {
    // 23505 = unique_violation: dos requests concurrentes pasaron el
    // chequeo de arriba a la vez y una perdió la carrera contra la otra.
    if (dbError.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una nota con ese título", slug: slugBase },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ articulo: data }, { status: 201 });
}
