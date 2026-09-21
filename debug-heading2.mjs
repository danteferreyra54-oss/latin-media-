import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data } = await supabase
  .from('articulos')
  .select('cuerpo')
  .eq('slug', 'kicillof-celebro-la-llegada-del-nuevo-papa-y-lo-comparo-con-');

if (data && data[0]) {
  const cuerpo = data[0].cuerpo;
  const lines = cuerpo.split('\n');
  console.log('Últimas 10 líneas:\n');
  lines.slice(-10).forEach((line, i) => {
    console.log(`${i}: "${line}"`);
  });
}
