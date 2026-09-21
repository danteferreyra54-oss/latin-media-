import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data: articulos } = await supabase
  .from('articulos')
  .select('id, slug, cuerpo');

console.log(`Procesando ${articulos.length} artículos...\n`);

let reparadas = 0;

for (const art of articulos) {
  if (!art.cuerpo) continue;

  let cuerpoNuevo = art.cuerpo;
  let cambios = 0;

  // Patrón: imagen o embed pegado directamente a un heading o párrafo sin salto de línea
  // ![](URL)### heading
  cuerpoNuevo = cuerpoNuevo.replace(/\)\n*###/g, ')\n\n###');
  if (cuerpoNuevo !== art.cuerpo) cambios++;

  // ```twitter\nURL\n```### heading
  cuerpoNuevo = cuerpoNuevo.replace(/```\n*###/g, '```\n\n###');
  if (cuerpoNuevo !== art.cuerpo) cambios++;

  // ```instagram\nURL\n```### heading
  cuerpoNuevo = cuerpoNuevo.replace(/```\n*###/g, '```\n\n###');
  if (cuerpoNuevo !== art.cuerpo) cambios++;

  // Imagen o embed pegada a párrafo normal
  // ![](URL)Texto sin salto de línea
  cuerpoNuevo = cuerpoNuevo.replace(/\]\([^)]+\)\n+([A-Z])/g, ']\($1)\n\n$2');
  if (cuerpoNuevo !== art.cuerpo) cambios++;

  // Limpiar saltos de línea excesivos
  cuerpoNuevo = cuerpoNuevo.replace(/\n{3,}/g, '\n\n');

  if (cuerpoNuevo !== art.cuerpo) {
    await supabase
      .from('articulos')
      .update({ cuerpo: cuerpoNuevo })
      .eq('id', art.id);

    reparadas++;
    console.log(`✓ ${art.slug.substring(0, 60)}`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Reparadas: ${reparadas} de ${articulos.length}`);
