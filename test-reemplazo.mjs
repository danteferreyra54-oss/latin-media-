import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ttjrcqvshgaoljsyxupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8'
);

function pathBase(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).toLowerCase();
  } catch (e) {
    console.log('ERROR parseando URL:', url, e.message);
    return url.split('?')[0].toLowerCase();
  }
}

const { data } = await supabase
  .from('articulos')
  .select('id, imagen, cuerpo')
  .eq('slug', 'allanaron-una-casa-en-lujan-con-una-detenida-domiciliaria-adentro');

const art = data[0];
const basePortada = pathBase(art.imagen);
console.log('basePortada:', basePortada);

const imagenes = [...art.cuerpo.matchAll(/!\[.*?\]\(([^)]+)\)/g)];
console.log(`\nEncontradas ${imagenes.length} imágenes en el cuerpo`);
imagenes.forEach((m, i) => {
  const base = pathBase(m[1]);
  console.log(`${i + 1}. base="${base}" -- coincide=${base === basePortada}`);
});

const cuerpoNuevo = art.cuerpo.replace(/!\[.*?\]\(([^)]+)\)/g, (match, url) => {
  const coincide = pathBase(url) === basePortada;
  console.log(`  replace fn: url="${url.substring(0,60)}..." coincide=${coincide}`);
  return coincide ? '' : match;
});

console.log('\n¿Cambió el cuerpo?', cuerpoNuevo !== art.cuerpo);

console.log('\nIntentando UPDATE...');
const { data: updateData, error } = await supabase
  .from('articulos')
  .update({ cuerpo: cuerpoNuevo })
  .eq('id', art.id)
  .select();

console.log('Error:', error);
console.log('Filas afectadas:', updateData?.length);
