import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

function normalizarURL(url) {
  if (!url) return '';
  // Quitar parámetros, espacios, comillas
  return url.split('?')[0].split('#')[0].trim().replace(/['"]/g, '');
}

function esImagenDuplicada(urlCuerpo, urlPortada) {
  const base1 = normalizarURL(urlCuerpo);
  const base2 = normalizarURL(urlPortada);

  if (!base1 || !base2) return false;

  // Comparaciones:
  // 1. URLs exactas iguales
  // 2. Una contiene a la otra (para variaciones de CDN)
  return base1 === base2 || base1.includes(base2) || base2.includes(base1);
}

const { data: articulos } = await supabase
  .from('articulos')
  .select('id, slug, imagen, cuerpo')
  .not('imagen', 'is', null)
  .not('cuerpo', 'is', null)
  .limit(600);

console.log(`Procesando ${articulos.length} artículos...\n`);

let reparadas = 0;
let totalImagenesEliminadas = 0;

for (const art of articulos) {
  const urlPortada = normalizarURL(art.imagen);
  if (!urlPortada) continue;

  let cuerpoNuevo = art.cuerpo;
  let cambios = 0;

  // Buscar imágenes en formato markdown: ![...](URL)
  const patronMarkdown = /!\[.*?\]\(([^)]+)\)/g;
  cuerpoNuevo = cuerpoNuevo.replace(patronMarkdown, (match, url) => {
    if (esImagenDuplicada(url, urlPortada)) {
      cambios++;
      return ''; // Eliminar
    }
    return match;
  });

  // Buscar imágenes HTML directo: <img src="URL">
  const patronHTML = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  cuerpoNuevo = cuerpoNuevo.replace(patronHTML, (match, url) => {
    if (esImagenDuplicada(url, urlPortada)) {
      cambios++;
      return ''; // Eliminar
    }
    return match;
  });

  // Buscar referencias de imagen en bloques HTML o atributos data
  const patronDataImg = /data-image=["']([^"']+)["']/gi;
  cuerpoNuevo = cuerpoNuevo.replace(patronDataImg, (match, url) => {
    if (esImagenDuplicada(url, urlPortada)) {
      cambios++;
      return ''; // Eliminar
    }
    return match;
  });

  // Limpiar saltos de línea extra
  cuerpoNuevo = cuerpoNuevo.replace(/\n\n\n+/g, '\n\n').trim();

  if (cambios > 0 && cuerpoNuevo !== art.cuerpo) {
    await supabase
      .from('articulos')
      .update({ cuerpo: cuerpoNuevo })
      .eq('id', art.id);

    reparadas++;
    totalImagenesEliminadas += cambios;
    console.log(`✓ ${art.slug.substring(0, 60)} — ${cambios} imagen(es) eliminada(s)`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Reparadas: ${reparadas} de ${articulos.length}`);
console.log(`Total imágenes duplicadas eliminadas: ${totalImagenesEliminadas}`);
