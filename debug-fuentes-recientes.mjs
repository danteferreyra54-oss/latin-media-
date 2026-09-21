import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data, error } = await supabase
  .from('articulos')
  .select('id, titulo, fuente, fecha')
  .order('fecha', { ascending: false })
  .limit(20);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Últimas 20 notas y sus fuentes:\n');
  data.forEach(n => {
    const fecha = new Date(n.fecha).toLocaleString('es-AR');
    console.log(`${n.fuente.padEnd(20)} | ${fecha} | ${n.titulo.substring(0, 60)}`);
  });
}
