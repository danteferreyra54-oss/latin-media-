import { headers } from "next/headers";

/** Cuánto tiempo cachea Next.js la respuesta de clima (segundos). */
export const REVALIDATE_CLIMA = 1800; // 30 min

export interface ClimaCiudad {
  ciudad: string;
  temperatura: number;
}

const BUENOS_AIRES = { lat: -34.6037, lon: -58.3816, ciudad: "Buenos Aires" };

/**
 * Detecta la ubicación del visitante por los headers de geolocalización que
 * Vercel inyecta automáticamente en cada request (x-vercel-ip-*), y trae la
 * temperatura actual de esa ciudad desde Open-Meteo (API pública, sin key).
 * En local (sin esos headers) o si falla el fetch, cae a Buenos Aires.
 */
export async function getClimaPorUbicacion(): Promise<ClimaCiudad> {
  const headersList = await headers();

  const ciudadHeader = headersList.get("x-vercel-ip-city");
  const latHeader = headersList.get("x-vercel-ip-latitude");
  const lonHeader = headersList.get("x-vercel-ip-longitude");

  const lat = latHeader ? parseFloat(latHeader) : BUENOS_AIRES.lat;
  const lon = lonHeader ? parseFloat(lonHeader) : BUENOS_AIRES.lon;
  const ciudad = ciudadHeader ? decodeURIComponent(ciudadHeader) : BUENOS_AIRES.ciudad;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
      { next: { revalidate: REVALIDATE_CLIMA } }
    );

    if (!res.ok) throw new Error(`open-meteo respondió ${res.status}`);

    const data = (await res.json()) as { current?: { temperature_2m?: number } };
    const temperatura = data.current?.temperature_2m;

    if (typeof temperatura !== "number") throw new Error("Respuesta sin temperatura");

    return { ciudad, temperatura: Math.round(temperatura) };
  } catch (error) {
    console.error("Error trayendo el clima:", error);
    return { ciudad: BUENOS_AIRES.ciudad, temperatura: 11 };
  }
}
