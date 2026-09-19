/** Cuánto tiempo cachea Next.js la cotización (segundos). */
export const REVALIDATE_DOLAR = 600; // 10 min

export interface CotizacionDolar {
  compra: number;
  venta: number;
}

/**
 * Trae la cotización del dólar blue desde dolarapi.com (API pública,
 * sin key). Se usa server-side en el header, con revalidate corto porque
 * la cotización se mueve durante el día.
 */
export async function getCotizacionDolarBlue(): Promise<CotizacionDolar | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: REVALIDATE_DOLAR },
    });

    if (!res.ok) {
      throw new Error(`dolarapi.com respondió ${res.status}`);
    }

    const data = (await res.json()) as { compra: number; venta: number };
    return { compra: data.compra, venta: data.venta };
  } catch (error) {
    console.error("Error trayendo cotización del dólar:", error);
    return null;
  }
}
