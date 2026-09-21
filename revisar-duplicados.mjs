import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ttjrcqvshgaoljsyxupe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerPalabrasClaves(texto) {
  return normalizar(texto)
    .split(/\s+/)
    .filter(p => p.length > 4)
    .slice(0, 5);
}

async function main() {
  console.log("Buscando duplicados en Supabase...\n");

  const { data: articulos, error } = await supabase
    .from("articulos")
    .select("id, titulo, slug, fecha")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Total de artículos: ${articulos.length}\n`);

  const grupos = new Map();
  const duplicados = [];

  for (const art of articulos) {
    const palabras = obtenerPalabrasClaves(art.titulo);

    for (const palabra of palabras) {
      if (!grupos.has(palabra)) {
        grupos.set(palabra, []);
      }
      grupos.get(palabra).push(art);
    }
  }

  for (const [palabra, notas] of grupos) {
    if (notas.length > 1) {
      // Filtrar solo notas del mismo día
      const porFecha = new Map();
      for (const nota of notas) {
        const fecha = nota.fecha.split("T")[0];
        if (!porFecha.has(fecha)) {
          porFecha.set(fecha, []);
        }
        porFecha.get(fecha).push(nota);
      }

      for (const [fecha, notasDia] of porFecha) {
        if (notasDia.length > 1) {
          duplicados.push({
            palabra,
            fecha,
            notas: notasDia,
          });
        }
      }
    }
  }

  if (duplicados.length === 0) {
    console.log("✅ No hay duplicados semánticos detectados");
    return;
  }

  console.log(`⚠️  Encontrados ${duplicados.length} grupos de posibles duplicados:\n`);

  duplicados.sort((a, b) => b.notas.length - a.notas.length);

  for (const grupo of duplicados.slice(0, 20)) {
    console.log(`Palabra clave: "${grupo.palabra}" (${grupo.fecha})`);
    for (const nota of grupo.notas) {
      console.log(`  - ${nota.titulo}\n    Slug: ${nota.slug}`);
    }
    console.log("");
  }

  if (duplicados.length > 20) {
    console.log(`... y ${duplicados.length - 20} grupos más`);
  }
}

main();
