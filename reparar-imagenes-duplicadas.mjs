import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data: articulos } = await supabase
  .from('articulos')
  .select('id, slug, imagen, cuerpo')
  .not('imagen', 'is', null)
  .not('cuerpo', 'is', null);

console.log(`Procesando ${articulos.length} artículos...\n`);

let reparadas = 0;

for (const art of articulos) {
  const urlBase = art.imagen.split('?')[0];

  // Patrón para encontrar imágenes dentro del cuerpo markdown: ![](URL)
  const patron = /!\[\]\(([^)]+)\)/g;
  let cuerpoNuevo = art.cuerpo;
  let cambios = 0;

  cuerpoNuevo = cuerpoNuevo.replace(patron, (match, url) => {
    const urlBaseImagen = url.split('?')[0];

    // Si es la misma imagen de portada, quítala
    if (urlBaseImagen === urlBase) {
      cambios++;
      return ''; // Eliminar la imagen
    }
    return match; // Mantener otras imágenes
  });

  // Limpiar saltos de línea extra que quedan después de eliminar imágenes
  cuerpoNuevo = cuerpoNuevo.replace(/\n\n\n+/g, '\n\n');

  if (cambios > 0) {
    await supabase
      .from('articulos')
      .update({ cuerpo: cuerpoNuevo })
      .eq('id', art.id);

    reparadas++;
    console.log(`✓ ${art.slug.substring(0, 60)} — ${cambios} imagen(es) duplicada(s) eliminada(s)`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Reparadas: ${reparadas} de ${articulos.length}`);
