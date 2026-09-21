import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000);

const { data } = await supabase
  .from('articulos')
  .select('id, titulo, fuente, fecha, fuente_original')
  .gt('fecha', hace24hs.toISOString())
  .order('fecha', { ascending: false });

console.log(`Notas de últimas 24 horas: ${data.length}\n`);

const desconocidas = data.filter(n => n.fuente === 'Desconocido');
console.log(`Con fuente "Desconocido": ${desconocidas.length}\n`);

// Agrupar por hora
const porHora = {};
desconocidas.forEach(n => {
  const fecha = new Date(n.fecha);
  const hora = fecha.getHours() + ':00';
  if (!porHora[hora]) porHora[hora] = [];
  porHora[hora].push(n);
});

console.log('Distribución por hora:');
Object.entries(porHora).sort().forEach(([hora, notas]) => {
  console.log(`  ${hora}: ${notas.length} notas`);
  // Mostrar si todas tienen fuente_original
  const conOriginal = notas.filter(n => n.fuente_original).length;
  console.log(`    Con fuente_original: ${conOriginal}/${notas.length}`);
});
