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
  let original = art.cuerpo;

  // Reparar: ![](URL)### o ```### sin salto de línea entre medio
  cuerpoNuevo = cuerpoNuevo.replace(/\)\n*###/g, ')\n\n###');
  cuerpoNuevo = cuerpoNuevo.replace(/```\n*###/g, '```\n\n###');

  // Reparar: ![](URL) seguido de párrafo sin salto de línea
  // Detectar si hay una línea que termina con ) y la siguiente empieza con mayúscula (es párrafo)
  const lines = cuerpoNuevo.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    // Si la línea actual es una imagen o embed y la próxima es un párrafo
    if ((current.match(/\]\([^)]+\)$/) || current.match(/^```[a-z]+$/) || current === '```')) {
      // Y entre ellas no hay línea en blanco
      if (next && next.match(/^[A-Z]/) && !current.match(/^$/) && next.trim()) {
        lines[i] = current;
        lines.splice(i + 1, 0, ''); // Insertar línea en blanco
        i++; // Saltar la línea insertada
      }
    }
  }
  cuerpoNuevo = lines.join('\n');

  // Limpiar saltos de línea excesivos
  cuerpoNuevo = cuerpoNuevo.replace(/\n{3,}/g, '\n\n').trim();

  if (cuerpoNuevo !== original) {
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
