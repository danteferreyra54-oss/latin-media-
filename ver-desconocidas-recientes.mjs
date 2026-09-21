import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000);

const { data } = await supabase
  .from('articulos')
  .select('titulo, fuente_original, fecha')
  .gt('fecha', hace24hs.toISOString())
  .eq('fuente', 'Desconocido')
  .order('fecha', { ascending: false })
  .limit(10);

console.log('10 notas "Desconocido" más recientes:\n');
data.forEach((n, i) => {
  const fecha = new Date(n.fecha);
  const orig = n.fuente_original ? n.fuente_original.replace(/^=/, '') : 'null';

  // Extraer dominio
  let dominio = '';
  try {
    const url = new URL(orig);
    dominio = url.hostname;
  } catch (e) {
    dominio = orig.substring(0, 30);
  }

  console.log(`${i + 1}. ${fecha.toLocaleString('es-AR')}`);
  console.log(`   ${n.titulo.substring(0, 70)}`);
  console.log(`   Dominio: ${dominio}`);
  console.log();
});
