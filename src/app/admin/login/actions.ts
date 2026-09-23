"use server";

import { redirect } from "next/navigation";
import { abrirSesion, cerrarSesionCookie, credencialesValidas } from "@/lib/auth";

export type EstadoLogin = { error: string } | undefined;

/** Solo se vuelve a páginas del panel, nunca a otro sitio. */
function destinoSeguro(volver: FormDataEntryValue | null) {
  const v = typeof volver === "string" ? volver : "";
  return v.startsWith("/admin") && !v.startsWith("/admin/login") ? v : "/admin";
}

export async function iniciarSesion(_prev: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!credencialesValidas(email, password)) {
    // demora chica para que no se puedan probar miles de contraseñas por segundo
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "Mail o contraseña incorrectos." };
  }

  await abrirSesion();
  redirect(destinoSeguro(formData.get("volver")));
}

export async function cerrarSesion() {
  await cerrarSesionCookie();
  redirect("/admin/login");
}
