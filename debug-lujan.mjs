import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data } = await supabase
  .from('articulos')
  .select('imagen, cuerpo')
  .eq('slug', 'allanaron-una-casa-en-lujan-con-una-detenida-domiciliaria-adentro');

if (data && data[0]) {
  const art = data[0];
  console.log('IMAGEN PORTADA:');
  console.log(art.imagen);
  console.log('\nTODAS LAS IMÁGENES EN EL CUERPO:');
  const imagenes = [...art.cuerpo.matchAll(/!\[.*?\]\(([^)]+)\)/g)].map(m => m[1]);
  imagenes.forEach((img, i) => console.log(`${i + 1}. ${img}`));
}
