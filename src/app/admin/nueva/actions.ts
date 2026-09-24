"use server";

import { verificarSesion } from "@/lib/auth";
import { headers } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";

interface DatosNota {
  titulo: string;
  bajada: string;
  cuerpo: string;
  seccion: string;
  autor: string;
  slug: string;
  imagen: string;
  epigrafe?: string | null;
  faqs?: Array<{ pregunta: string; respuesta: string }>;
}

export type ResultadoSubida = { ok: true; url: string } | { ok: false; error: string };

/** Sube una imagen pegada en el editor al bucket "imagenes" y devuelve su URL pública. */
export async function subirImagen(formData: FormData): Promise<ResultadoSubida> {
  await verificarSesion();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No se recibió ningún archivo." };
  }

  const supabase = createAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const ruta = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("imagenes")
    .upload(ruta, file, { contentType: file.type || "image/png", upsert: false });

  if (error) {
    console.error("subirImagen: error de Supabase Storage", error);
    return { ok: false, error: `No se pudo subir la imagen: ${error.message}` };
  }

  const { data } = supabase.storage.from("imagenes").getPublicUrl(ruta);
  return { ok: true, url: data.publicUrl };
}

export type ResultadoGuardado = { ok: true; slug: string } | { ok: false; error: string };

/** Crea una nota nueva llamando a POST /api/articles con los datos cargados a mano.
 * Devuelve un resultado en vez de lanzar excepciones para errores esperados
 * (validación, duplicados): Next.js oculta el mensaje real de cualquier error
 * lanzado desde una Server Action en producción y lo reemplaza por un React
 * error #441 genérico, así que estos casos viajan como datos, no como throw. */
export async function crearNota(datos: DatosNota): Promise<ResultadoGuardado> {
  await verificarSesion();

  if (!process.env.ARTICLES_API_KEY) {
    return { ok: false, error: "Falta configurar ARTICLES_API_KEY." };
  }

  const encabezados = await headers();
  const protocolo = encabezados.get("x-forwarded-proto") ?? "https";
  const host = encabezados.get("host");
  const url = `${protocolo}://${host}/api/articles`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ARTICLES_API_KEY,
      },
      body: JSON.stringify({
        titulo: datos.titulo,
        bajada: datos.bajada,
        cuerpo: datos.cuerpo,
        seccion: datos.seccion,
        autor: datos.autor,
        fecha: new Date().toISOString(),
        fuente: "Latin Media",
        slug: datos.slug,
        imagen: datos.imagen,
        epigrafe: datos.epigrafe,
        faqs: datos.faqs,
      }),
    });
  } catch (fetchError) {
    console.error("crearNota: fallo la conexión a /api/articles", fetchError);
    return {
      ok: false,
      error: `No se pudo conectar con el servidor: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
    };
  }

  const textoBruto = await res.text();
  let payload: { error?: string; slug?: string; articulo?: { slug: string } };
  try {
    payload = JSON.parse(textoBruto);
  } catch {
    console.error(
      `crearNota: respuesta no-JSON de /api/articles (status ${res.status}):`,
      textoBruto.slice(0, 500)
    );
    return { ok: false, error: `El servidor respondió ${res.status} con un cuerpo inesperado.` };
  }

  if (!res.ok) {
    return { ok: false, error: payload.error || `El servidor respondió ${res.status}` };
  }

  if (!payload.articulo?.slug) {
    console.error("crearNota: respuesta OK pero sin articulo.slug:", payload);
    return { ok: false, error: "El servidor no devolvió el slug de la nota creada." };
  }

  return { ok: true, slug: payload.articulo.slug };
}
