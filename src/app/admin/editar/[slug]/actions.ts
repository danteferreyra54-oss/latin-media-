"use server";

import { verificarSesion } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/slugify";
import type { DatosNota } from "../../NotaForm";
import type { ResultadoGuardado } from "../../nueva/actions";

/** Actualiza una nota existente. Filtra por el slug original; si el usuario
 * editó el campo slug, la fila pasa a tener el nuevo valor (saneado).
 * Devuelve un resultado en vez de lanzar excepciones para errores esperados:
 * Next.js oculta el mensaje real de cualquier error lanzado desde una Server
 * Action en producción y lo reemplaza por un React error #441 genérico. */
export async function actualizarNota(slugOriginal: string,
  datos: DatosNota
): Promise<ResultadoGuardado> {
  await verificarSesion();

  const supabase = createAdminClient();
  const nuevoSlug = datos.slug ? slugify(datos.slug) : slugOriginal;

  const updateData: Record<string, any> = {
    titulo: datos.titulo,
    bajada: datos.bajada,
    cuerpo: datos.cuerpo,
    seccion: datos.seccion,
    autor: datos.autor,
    slug: nuevoSlug,
    imagen: datos.imagen,
  };

  if (datos.faqs !== undefined) {
    updateData.faqs = datos.faqs;
  }

  const { data, error } = await supabase
    .from("articulos")
    .update(updateData)
    .eq("slug", slugOriginal)
    .select("slug")
    .single();

  if (error) {
    console.error("actualizarNota: error de Supabase", error);
    return { ok: false, error: `No se pudo actualizar la nota: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath(`/nota/${slugOriginal}`);
  if (nuevoSlug !== slugOriginal) {
    revalidatePath(`/nota/${nuevoSlug}`);
  }

  return { ok: true, slug: data.slug };
}
