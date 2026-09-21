import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ttjrcqvshgaoljsyxupe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const slugs = [
  "asueto-en-salud-el-21-de-septiembre-que-servicios-funcionan-en-salta",
  "francia-apaga-el-2g-en-2026-y-232-000-ascensores-quedan-sin-sistema-de-alarma",
];

async function main() {
  for (const slug of slugs) {
    const { data: articulo, error } = await supabase
      .from("articulos")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.log(`❌ Error buscando ${slug}: ${error.message}`);
      continue;
    }

    console.log(`\n📰 ${articulo.titulo}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Fuente: ${articulo.fuente}`);
    console.log(`   Fuente Original: ${articulo.fuente_original}`);
    console.log(`   Link: ${articulo.link}`);
    console.log(`   Fecha: ${articulo.fecha}`);
    console.log(`   Topic Key: ${articulo.topic_key}`);
  }
}

main();
