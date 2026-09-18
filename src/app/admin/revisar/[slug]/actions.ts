"use server";

import { createAdminClient } from "@/utils/supabase/admin";

function verificarClave(clave: string) {
  if (!process.env.ADMIN_KEY || clave !== process.env.ADMIN_KEY) {
    throw new Error("No autorizado");
  }
}

async function llamarWebhook(url: string | undefined, payload: unknown) {
  if (!url) {
    throw new Error(
      "Falta configurar la URL del webhook de n8n (variable de entorno no seteada)."
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`El webhook respondió ${res.status}`);
  }
}

interface DatosNota {
  slug: string;
  titulo: string;
  bajada: string;
  cuerpo: string;
}

/** Aprueba la nota tal cual está, sin guardar cambios. */
export async function aprobarNota(clave: string, datos: DatosNota) {
  verificarClave(clave);
  await llamarWebhook(process.env.N8N_WEBHOOK_APROBAR, datos);
}

/** Guarda los cambios en Supabase y después aprueba con el contenido corregido. */
export async function corregirYAprobarNota(clave: string, datos: DatosNota) {
  verificarClave(clave);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("articulos")
    .update({ titulo: datos.titulo, bajada: datos.bajada, cuerpo: datos.cuerpo })
    .eq("slug", datos.slug);

  if (error) {
    throw new Error(`No se pudo guardar en Supabase: ${error.message}`);
  }

  await llamarWebhook(process.env.N8N_WEBHOOK_APROBAR, datos);
}

/** Rechaza la nota (no guarda cambios de edición, si los hubiera). */
export async function rechazarNota(clave: string, slug: string) {
  verificarClave(clave);
  await llamarWebhook(process.env.N8N_WEBHOOK_RECHAZAR, { slug });
}
