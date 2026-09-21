import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ttjrcqvshgaoljsyxupe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: notas } = await supabase
    .from("articulos")
    .select("id, slug, titulo, fuente")
    .eq("fuente", "Desconocido");

  console.log("Notas sin identificar:\n");
  console.log(
    notas
      .map(
        (n, i) =>
          `${i + 1}. ${n.titulo}\n   Slug: ${n.slug}\n   ID: ${n.id}\n`
      )
      .join("")
  );

  console.log(
    "\nEdita el script, reemplaza el ID con la fuente correcta y ejecutá update-source.mjs"
  );
}

main();
