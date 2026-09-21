import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ttjrcqvshgaoljsyxupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ3NzY0OCwiZXhwIjoyMTA1MDUzNjQ4fQ.iNmc5B8LRjNqZHQvtElLPzBo21nRh98i2d_OibjctJI'
);

function pathBase(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Ignorar todos los query params, comparar solo protocolo+host+path
    return (u.hostname + u.pathname).toLowerCase();
  } catch {
    return url.split('?')[0].toLowerCase();
  }
}

// Traer TODAS las notas, paginando de a 500
let todas = [];
let desde = 0;
const pageSize = 500;
while (true) {
  const { data, error } = await supabase
    .from('articulos')
    .select('id, slug, imagen, cuerpo')
    .range(desde, desde + pageSize - 1);
  if (error) { console.error(error); break; }
  if (!data || data.length === 0) break;
  todas = todas.concat(data);
  if (data.length < pageSize) break;
  desde += pageSize;
}

console.log(`Total de notas: ${todas.length}\n`);

let reparadasImagen = 0;
let reparadasHeading = 0;

for (const art of todas) {
  if (!art.cuerpo) continue;
  let cuerpoNuevo = art.cuerpo;
  const original = art.cuerpo;

  // ===== 1) IMAGEN DE PORTADA DUPLICADA EN EL CUERPO =====
  if (art.imagen) {
    const basePortada = pathBase(art.imagen);
    if (basePortada) {
      cuerpoNuevo = cuerpoNuevo.replace(/!\[.*?\]\(([^)]+)\)/g, (match, url) => {
        return pathBase(url) === basePortada ? '' : match;
      });
    }
  }

  // ===== 2) HEADINGS/TEXTO PEGADOS A IMAGEN O EMBED SIN SALTO DE LÍNEA =====
  cuerpoNuevo = cuerpoNuevo.replace(/\)\s{0,1}###/g, ')\n\n###');
  cuerpoNuevo = cuerpoNuevo.replace(/```\s{0,1}###/g, '```\n\n###');
  cuerpoNuevo = cuerpoNuevo.replace(/\)([A-ZÁÉÍÓÚÑ])/g, ')\n\n$1');
  cuerpoNuevo = cuerpoNuevo.replace(/```([A-ZÁÉÍÓÚÑ])/g, '```\n\n$1');

  // Limpiar saltos de línea excesivos que puedan haber quedado
  cuerpoNuevo = cuerpoNuevo.replace(/\n{3,}/g, '\n\n').trim();

  if (cuerpoNuevo !== original) {
    const { data: updData, error: updErr } = await supabase
      .from('articulos')
      .update({ cuerpo: cuerpoNuevo })
      .eq('id', art.id)
      .select('id');

    if (updErr) {
      console.log(`✗ ERROR en ${art.slug.substring(0, 60)}: ${updErr.message}`);
      continue;
    }
    if (!updData || updData.length === 0) {
      console.log(`✗ 0 FILAS AFECTADAS en ${art.slug.substring(0, 60)}`);
      continue;
    }

    const teniaImagenDup = /!\[.*?\]\(([^)]+)\)/g.test(original) && art.imagen &&
      [...original.matchAll(/!\[.*?\]\(([^)]+)\)/g)].some(m => pathBase(m[1]) === pathBase(art.imagen));

    if (teniaImagenDup) reparadasImagen++;
    else reparadasHeading++;

    console.log(`✓ ${art.slug.substring(0, 70)}`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Notas reparadas por imagen duplicada: ${reparadasImagen}`);
console.log(`Notas reparadas por heading/texto pegado: ${reparadasHeading}`);

// ===== VERIFICACIÓN FINAL: volver a chequear que no quede nada =====
console.log(`\n--- VERIFICACIÓN FINAL ---`);
let desde2 = 0;
let todasVerif = [];
while (true) {
  const { data } = await supabase
    .from('articulos')
    .select('id, slug, imagen, cuerpo')
    .range(desde2, desde2 + pageSize - 1);
  if (!data || data.length === 0) break;
  todasVerif = todasVerif.concat(data);
  if (data.length < pageSize) break;
  desde2 += pageSize;
}

let quedanImagen = 0;
let quedanHeading = 0;
for (const art of todasVerif) {
  if (!art.cuerpo) continue;
  if (art.imagen) {
    const basePortada = pathBase(art.imagen);
    const dup = [...art.cuerpo.matchAll(/!\[.*?\]\(([^)]+)\)/g)].some(m => pathBase(m[1]) === basePortada);
    if (dup) { quedanImagen++; console.log(`  AÚN DUPLICADA: ${art.slug}`); }
  }
  if (/\)\s{0,1}###/.test(art.cuerpo) || /```\s{0,1}###/.test(art.cuerpo) || /\)[A-ZÁÉÍÓÚÑ]/.test(art.cuerpo)) {
    quedanHeading++;
    console.log(`  AÚN PEGADO: ${art.slug}`);
  }
}
console.log(`\nNotas que AÚN tienen imagen duplicada: ${quedanImagen}`);
console.log(`Notas que AÚN tienen heading/texto pegado: ${quedanHeading}`);
