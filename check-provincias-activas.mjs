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
  .select("provincia")
  .not("provincia", "is", null)
  .eq("oculta", false);

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

const conteos = {};
data.forEach(nota => {
  conteos[nota.provincia] = (conteos[nota.provincia] || 0) + 1;
});

const provincias = Object.keys(conteos).sort((a, b) => conteos[b] - conteos[a]);

console.log("Provincias con notas (ordenadas por cantidad):\n");
provincias.forEach(p => {
  console.log(`${p}: ${conteos[p]} notas`);
});

console.log("\n\nPara el NAV_ITEMS, usar SOLO estas provincias:");
console.log(provincias.map(p => `"${p}"`).join(", "));
