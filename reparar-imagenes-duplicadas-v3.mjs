import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

function normalizarURL(url) {
  if (!url) return '';
  return url.split('?')[0].split('#')[0].trim().replace(/['"]/g, '');
}

function extraerDominio(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return '';
  }
}

function extraerIDImagenDeURL(url) {
  // Para URLs de imagen como:
  // https://media.c5n.com/p/88996bc1373d5fa5097658e67d1d5b7d/adjuntos/326/imagenes/000/399/0000399681/12...
  // Extraer el ID único (la parte antes de los últimos parámetros)
  const parts = url.split('/');
  // Tomar los últimos 4-5 componentes que probablemente sean únicos
  return parts.slice(-5).join('/');
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

  const dominioPortada = extraerDominio(urlPortada);
  const idPortada = extraerIDImagenDeURL(urlPortada);

  let cuerpoNuevo = art.cuerpo;
  let cambios = 0;

  // Buscar TODAS las URLs que contengan ese dominio + similitud de ID
  const patronURL = /(https?:\/\/[^\s"')<>]+)/g;

  const matches = [...cuerpoNuevo.matchAll(patronURL)];

  for (const match of matches) {
    const urlEnCuerpo = match[0];
    const dominioEnCuerpo = extraerDominio(urlEnCuerpo);
    const idEnCuerpo = extraerIDImagenDeURL(urlEnCuerpo);

    // Si el dominio coincide y los IDs son similares, es probable duplicado
    if (dominioPortada && dominioEnCuerpo && dominioPortada.includes(dominioEnCuerpo.split('.')[0])) {
      if (idPortada === idEnCuerpo || urlEnCuerpo.includes(idPortada)) {
        // Es una URL de la misma imagen, hay que eliminarla
        // Buscar el patrón completo y eliminarlo
        const patrones = [
          new RegExp(`!\\[.*?\\]\\(${urlEnCuerpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
          new RegExp(`<img[^>]+src=["']${urlEnCuerpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'),
          new RegExp(urlEnCuerpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        ];

        for (const patron of patrones) {
          if (patron.test(cuerpoNuevo)) {
            cuerpoNuevo = cuerpoNuevo.replace(patron, '');
            cambios++;
            break;
          }
        }
      }
    }
  }

  // Limpiar saltos de línea extra
  cuerpoNuevo = cuerpoNuevo.replace(/\n\n\n+/g, '\n\n').trim();

  if (cambios > 0 && cuerpoNuevo !== art.cuerpo && cuerpoNuevo.trim().length > 50) {
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
