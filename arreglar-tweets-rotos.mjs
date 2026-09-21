import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ttjrcqvshgaoljsyxupe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8'
);

const { data } = await supabase
  .from('articulos')
  .select('id,slug,cuerpo')
  .or("slug.eq.llaryora-rechazo-los-cortes-nacionales-en-discapacidad-y-marco-diferencias-con-milei,slug.eq.stephen-king-recomendo-la-nueva-serie-basada-en-mariana-enriquez,slug.eq.coki-ramirez-hizo-un-comentario-sobre-nahuel-pennisi-y-exploto-en-redes");

if (!data || data.length === 0) {
  console.log('No se encontraron notas para arreglar');
  process.exit(0);
}

console.log(`Encontradas ${data.length} notas con tweets rotos\n`);

for (const nota of data) {
  const cuerpoOrig = nota.cuerpo;

  // Buscar patrón: texto suelto "twitter https://x.com/..." o "twitter https://twitter.com/..."
  const patron = /(\s+)twitter\s+(https?:\/\/(?:x\.com|twitter\.com)\/\S+?)(\s+|$)/gi;
  const matches = [...cuerpoOrig.matchAll(patron)];

  if (matches.length === 0) {
    console.log(`✗ ${nota.slug}: no encontré tweets rotos`);
    continue;
  }

  let cuerpoNuevo = cuerpoOrig;
  for (const match of matches) {
    const [original, espacioAnte, url, espacioDespues] = match;
    const bloque = `\n\n\`\`\`twitter\n${url}\n\`\`\`\n`;
    cuerpoNuevo = cuerpoNuevo.replace(original, bloque);
  }

  // Actualizar en la BD
  const { error } = await supabase
    .from('articulos')
    .update({ cuerpo: cuerpoNuevo })
    .eq('id', nota.id);

  if (error) {
    console.log(`✗ ${nota.slug}: error al actualizar:`, error.message);
  } else {
    console.log(`✓ ${nota.slug}: ${matches.length} tweet(s) arreglado(s)`);
  }
}

console.log('\nDone');
