import { createClient } from '@supabase/supabase-js';

const supabase2 = createClient(
  'https://ttjrcqvshgaoljsyxupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8'
);

// Paginar para traer TODAS las notas (no solo 1000 default)
let todas = [];
let desde = 0;
const pageSize = 500;
while (true) {
  const { data, error } = await supabase2
    .from('articulos')
    .select('id, slug, imagen, cuerpo')
    .range(desde, desde + pageSize - 1);
  if (error) { console.error(error); break; }
  if (!data || data.length === 0) break;
  todas = todas.concat(data);
  if (data.length < pageSize) break;
  desde += pageSize;
}

console.log(`Total de notas en la base: ${todas.length}\n`);

const problemaHeading = [];
const problemaImagenDuplicada = [];
const problemaImagenPegadaTexto = [];

function normalizarURL(url) {
  if (!url) return '';
  return url.split('?')[0].split('#')[0].trim();
}

function idImagen(url) {
  // Tomar los últimos 2 segmentos del path como "firma" de la imagen
  const partes = normalizarURL(url).split('/').filter(Boolean);
  return partes.slice(-2).join('/');
}

for (const art of todas) {
  if (!art.cuerpo) continue;
  const cuerpo = art.cuerpo;

  // 1) Heading pegado a imagen/embed sin salto de línea (### inmediatamente después de ) o ``` sin \n\n)
  if (/\)\s{0,1}###/.test(cuerpo) || /```\s{0,1}###/.test(cuerpo)) {
    problemaHeading.push(art);
  }

  // 2) Imagen o texto pegado directo a cierre de imagen/embed (sin salto de línea, letra mayúscula pegada)
  if (/\)[A-ZÁÉÍÓÚÑ]/.test(cuerpo) || /```[A-ZÁÉÍÓÚÑ]/.test(cuerpo)) {
    problemaImagenPegadaTexto.push(art);
  }

  // 3) Imagen de portada repetida dentro del cuerpo
  if (art.imagen) {
    const idPortada = idImagen(art.imagen);
    const imagenesEnCuerpo = [...cuerpo.matchAll(/!\[\]\(([^)]+)\)/g)].map(m => m[1]);
    for (const imgUrl of imagenesEnCuerpo) {
      if (idImagen(imgUrl) === idPortada) {
        problemaImagenDuplicada.push(art);
        break;
      }
    }
  }
}

console.log(`Notas con heading pegado a imagen/embed: ${problemaHeading.length}`);
problemaHeading.slice(0, 5).forEach(a => console.log(`  - ${a.slug}`));

console.log(`\nNotas con texto pegado a cierre de imagen/embed: ${problemaImagenPegadaTexto.length}`);
problemaImagenPegadaTexto.slice(0, 5).forEach(a => console.log(`  - ${a.slug}`));

console.log(`\nNotas con imagen de portada duplicada en el cuerpo: ${problemaImagenDuplicada.length}`);
problemaImagenDuplicada.slice(0, 10).forEach(a => console.log(`  - ${a.slug}`));

// Guardar IDs para el script de reparación
import { writeFileSync } from 'fs';
writeFileSync('C:\\Users\\dante\\latinmedia-nacional\\ids-problemas.json', JSON.stringify({
  headingPegado: problemaHeading.map(a => a.id),
  textoPegado: problemaImagenPegadaTexto.map(a => a.id),
  imagenDuplicada: problemaImagenDuplicada.map(a => a.id),
}, null, 2));
console.log('\nIDs guardados en ids-problemas.json');
