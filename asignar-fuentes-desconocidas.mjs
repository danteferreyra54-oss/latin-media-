import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function extraerFuenteDelLink(link) {
  if (!link) return "Desconocido";

  const dominios = {
    "infobae.com": "Infobae",
    "lanacion.com.ar": "La Nación",
    "ambito.com": "Ámbito",
    "losandes.com.ar": "Los Andes",
    "clarin.com": "Clarín",
    "cronista.com": "El Cronista",
    "tn.com.ar": "TN",
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
  };

  for (const [dominio, fuente] of Object.entries(dominios)) {
    if (link.includes(dominio)) {
      return fuente;
    }
  }

  return "Desconocido";
}

const { data, error } = await supabase
  .from("articulos")
  .select("slug,fuente,link")
  .eq("fuente", "Desconocido");

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.log(`Encontradas ${data.length} notas con fuente "Desconocido"\n`);

let actualizadas = 0;
const cambios = {};

for (const nota of data) {
  const nuevaFuente = extraerFuenteDelLink(nota.link);

  if (nuevaFuente !== "Desconocido") {
    await supabase
      .from("articulos")
      .update({ fuente: nuevaFuente })
      .eq("slug", nota.slug);

    cambios[nuevaFuente] = (cambios[nuevaFuente] || 0) + 1;
    actualizadas++;
    console.log(`✓ ${nota.slug.slice(0, 50)} → ${nuevaFuente}`);
  } else {
    console.log(`✗ ${nota.slug.slice(0, 50)} → No se pudo determinar (link: ${nota.link.slice(0, 60)})`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Actualizadas: ${actualizadas} de ${data.length}`);
console.log(`\nDesglose por fuente:`);
Object.entries(cambios)
  .sort((a, b) => b[1] - a[1])
  .forEach(([fuente, cantidad]) => {
    console.log(`  ${fuente}: ${cantidad}`);
  });
