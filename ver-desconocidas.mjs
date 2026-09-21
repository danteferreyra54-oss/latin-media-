import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data } = await supabase
  .from('articulos')
  .select('titulo, fuente, fuente_original')
  .eq('fuente', 'Desconocido')
  .limit(5);

console.log('Notas con fuente "Desconocido":');
data.forEach((n, i) => {
  console.log(`\n${i + 1}. ${n.titulo.substring(0, 60)}`);
  console.log(`   Fuente: ${n.fuente}`);
  console.log(`   Fuente original: ${n.fuente_original}`);
});
