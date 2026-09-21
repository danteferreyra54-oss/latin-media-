import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ttjrcqvshgaoljsyxupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8'
);

const slugs = [
  'stephen-king-recomendo-la-nueva-serie-basada-en-mariana-enriquez',
  'coki-ramirez-hizo-un-comentario-sobre-nahuel-pennisi-y-exploto-en-redes'
];

const { data } = await supabase
  .from('articulos')
  .select('id,slug,cuerpo')
  .in('slug', slugs);

if (!data || data.length === 0) {
  console.log('No se encontraron notas');
  process.exit(0);
}

for (const nota of data) {
  const c = nota.cuerpo;

  // Patrón más flexible: "twitter" seguido de espacios/saltos y una URL de x.com o twitter.com
  let cuerpoNuevo = c.replace(
    /twitter\s+(https?:\/\/(?:x\.com|twitter\.com)\/\S+)/g,
    '\n\n```twitter\n$1\n```\n'
  );

  if (c === cuerpoNuevo) {
    console.log(`✗ ${nota.slug}: no hay cambios`);
    continue;
  }

  const { error } = await supabase
    .from('articulos')
    .update({ cuerpo: cuerpoNuevo })
    .eq('id', nota.id);

  if (error) {
    console.log(`✗ ${nota.slug}: ${error.message}`);
  } else {
    console.log(`✓ ${nota.slug}: arreglado`);
  }
}

console.log('\nVerificando...');
const { data: check } = await supabase
  .from('articulos')
  .select('slug,cuerpo')
  .in('slug', slugs);

for (const nota of check) {
  const bloque = nota.cuerpo.match(/```twitter[\s\S]*?```/);
  console.log(`${nota.slug}: ${bloque ? '✓ bloque OK' : '✗ sin bloque'}`);
}
