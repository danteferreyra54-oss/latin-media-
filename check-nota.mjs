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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase
  .from("articulos")
  .select("*")
  .eq("slug", "farandula-2026-volvio-a-los-escenarios-y-encendio-la-temporada")
  .single();

if (error) {
  console.error("Error:", error);
} else {
  console.log("NOTA ENCONTRADA:");
  console.log("================");
  console.log("Fecha creación:", data.created_at);
  console.log("Título:", data.titulo);
  console.log("Fuente:", data.fuente);
  console.log("Imagen:", data.imagen);
  console.log("googleNewsSinResolver:", data.googleNewsSinResolver);
  console.log("\nTodos los campos:");
  console.log(JSON.stringify(data, null, 2));
}
