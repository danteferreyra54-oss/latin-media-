import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data } = await supabase
  .from('articulos')
  .select('cuerpo')
  .eq('slug', 'murio-greg-lewis-actor-de-the-wire-y-oz-a-los-58-anos');

if (data && data[0]) {
  const cuerpo = data[0].cuerpo;
  const lines = cuerpo.split('\n');
  console.log('Buscando líneas con ###:\n');
  lines.forEach((line, i) => {
    if (line.includes('###')) {
      console.log(`Línea ${i}: "${line}"`);
      console.log(`  Caracteres: ${JSON.stringify(line.split(''))}`);
    }
  });
}
