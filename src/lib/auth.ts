import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Login del panel: una sola cuenta compartida por todo el equipo.
// El mail está acá; la contraseña vive en la variable de entorno ADMIN_PASSWORD (Vercel).
export const ADMIN_EMAIL = "latinmediaok@gmail.com";

const COOKIE = "lm_admin";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 30; // la sesión dura 30 días

/** Valor de la cookie de sesión. Depende de la contraseña: si se cambia
 * ADMIN_PASSWORD, todas las sesiones abiertas se cierran solas. */
function tokenEsperado(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  const secreto = process.env.ADMIN_KEY;
  if (!password || !secreto) return null;
  return createHmac("sha256", secreto).update(`sesion:${ADMIN_EMAIL}:${password}`).digest("hex");
}

function iguales(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export function credencialesValidas(email: string, password: string) {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL && iguales(password, esperada);
}

export async function abrirSesion() {
  const token = tokenEsperado();
  if (!token) throw new Error("Falta configurar ADMIN_PASSWORD.");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function cerrarSesionCookie() {
  (await cookies()).delete(COOKIE);
}

export async function estaLogueado() {
  const token = tokenEsperado();
  const actual = (await cookies()).get(COOKIE)?.value;
  return !!token && !!actual && iguales(actual, token);
}

/** Para las páginas del panel: si no hay sesión, manda al login y después vuelve acá. */
export async function exigirSesion(volverA: string) {
  if (!(await estaLogueado())) {
    redirect(`/admin/login?volver=${encodeURIComponent(volverA)}`);
  }
}

/** Para las Server Actions del panel: sin sesión no se ejecuta nada. */
export async function verificarSesion() {
  if (!(await estaLogueado())) {
    throw new Error("No autorizado");
  }
}
