import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ttjrcqvshgaoljsyxupe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAPA_DOMINIOS = {
  "puntal.com.ar": "Puntal",
  "eldoce.tv": "El Doce",
  "a24.com": "A24",
  "mdzol.com": "MDZ Online",
  "c5n.com": "C5N",
  "ellitoral.com": "El Litoral",
  "airedesantafe.com.ar": "Aire de Santa Fe",
  "eltribuno.com": "El Tribuno",
  "lacapital.com.ar": "La Capital",
  "cuarto.com.ar": "Cuarto",
  "infobae.com": "Infobea",
  "lanacion.com.ar": "La Nación",
  "ambito.com": "Ámbito",
  "losandes.com.ar": "Los Andes",
  "clarin.com": "Clarín",
  "cronista.com": "El Cronista",
  "tn.com.ar": "TN",
  "elsol.com.ar": "El Sol",
  "informatesalta.com.ar": "Informate Salta",
  "rosario3.com": "Rosario 3",
  "cba24n.com.ar": "CBA24N",
  "perfil.com": "Perfil",
};

function extraerFuente(url) {
  if (!url) return "Desconocido";

  // Si es un token de Google News, devolver Desconocido
  if (url.startsWith("CBM")) return "Desconocido";

  // Buscar en el mapa de dominios
  for (const [dominio, nombre] of Object.entries(MAPA_DOMINIOS)) {
    if (url.includes(dominio)) return nombre;
  }

  // Intentar extraer el dominio de la URL
  try {
    const urlObj = new URL(url);
    const dominio = urlObj.hostname.replace(/^www\./, "");
    return dominio.charAt(0).toUpperCase() + dominio.slice(1);
  } catch {
    return "Desconocido";
  }
}

async function main() {
  console.log("Obteniendo notas con fuente desconocida...");

  const { data: notas, error } = await supabase
    .from("articulos")
    .select("id, slug, fuente, fuente_original")
    .eq("fuente", "Desconocido");

  if (error) {
    console.error("Error al obtener notas:", error);
    return;
  }

  console.log(`Encontradas ${notas.length} notas con fuente desconocida`);

  let actualizadas = 0;

  for (const nota of notas) {
    const fuente_real = extraerFuente(nota.fuente_original || nota.link);

    console.log(`${nota.slug}`);
    console.log(`  Link: ${nota.fuente_original || nota.link}`);
    console.log(`  Fuente identificada: ${fuente_real}`);

    if (fuente_real !== "Desconocido") {
      const { error: updateError } = await supabase
        .from("articulos")
        .update({ fuente: fuente_real })
        .eq("id", nota.id);

      if (updateError) {
        console.error(`  ERROR actualizando: ${updateError.message}`);
      } else {
        console.log(`  ✅ Actualizada`);
        actualizadas++;
      }
    } else {
      console.log(`  ❌ No identificada`);
    }
  }

  console.log(`\n✅ Actualizadas ${actualizadas} notas`);
}

main();
