"use server";

import { verificarSesion } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

/** Elimina una nota de la tabla `articulos` por slug. */
export async function eliminarNota(slug: string) {
  await verificarSesion();

  const supabase = createAdminClient();
  const { error } = await supabase.from("articulos").delete().eq("slug", slug);

  if (error) {
    throw new Error(`No se pudo eliminar la nota: ${error.message}`);
  }

  revalidatePath("/admin");
}

/** Oculta o vuelve a mostrar una nota (no la borra, solo la saca/pone en el sitio público). */
export async function cambiarVisibilidadNota(slug: string, oculta: boolean) {
  await verificarSesion();

  const supabase = createAdminClient();
  const { error } = await supabase.from("articulos").update({ oculta }).eq("slug", slug);

  if (error) {
    throw new Error(`No se pudo actualizar la nota: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/nota/${slug}`);
}
