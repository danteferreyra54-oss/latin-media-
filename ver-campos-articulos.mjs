import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const { data, error } = await supabase
  .from('articulos')
  .select('*')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Campos de articulos:');
  console.log(Object.keys(data[0]));
  console.log('\nEjemplo de una nota:');
  console.log(JSON.stringify(data[0], null, 2));
}
