import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ttjrcqvshgaoljsyxupe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const slug = "un-triatleta-bonaerense-llego-a-la-meta-en-azerbaiyan-con-bandera-de-malvinas";

async function main() {
  const { data: articulo, error } = await supabase
    .from("articulos")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }

  console.log(`📰 ${articulo.titulo}\n`);
  console.log(`Fuente: ${articulo.fuente}`);
  console.log(`Imagen (featured): ${articulo.imagen}\n`);
  console.log(`Cuerpo:\n${articulo.cuerpo.substring(0, 1000)}...`);
  console.log(`\n[Cuerpo total: ${articulo.cuerpo.length} caracteres]`);
}

main();
