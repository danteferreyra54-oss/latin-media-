/** Cuánto tiempo cachea Next.js la cotización (segundos). */
export const REVALIDATE_DOLAR = 600; // 10 min

export interface CotizacionDolar {
  compra: number;
  venta: number;
}

export interface CotizacionesDolar {
  blue: CotizacionDolar | null;
  oficial: CotizacionDolar | null;
}

async function fetchCotizacion(casa: "blue" | "oficial"): Promise<CotizacionDolar | null> {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${casa}`, {
      next: { revalidate: REVALIDATE_DOLAR },
    });

    if (!res.ok) {
      throw new Error(`dolarapi.com respondió ${res.status}`);
    }

    const data = (await res.json()) as { compra: number; venta: number };
    return { compra: data.compra, venta: data.venta };
  } catch (error) {
    console.error(`Error trayendo cotización del dólar ${casa}:`, error);
    return null;
  }
}

/**
 * Trae las cotizaciones del dólar blue y oficial desde dolarapi.com (API
 * pública, sin key). Se usa server-side en el header, con revalidate corto
 * porque la cotización se mueve durante el día.
 */
export async function getCotizacionesDolar(): Promise<CotizacionesDolar> {
  const [blue, oficial] = await Promise.all([
    fetchCotizacion("blue"),
    fetchCotizacion("oficial"),
  ]);

  return { blue, oficial };
}
