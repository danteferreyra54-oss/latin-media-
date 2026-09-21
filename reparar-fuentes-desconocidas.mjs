import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ttjrcqvshgaoljsyxupe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anJjcXZzaGdhb2xqc3l4dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0Nzc2NDgsImV4cCI6MjEwNTA1MzY0OH0.RGhoG-UND2xEkUYnRYqmXmewQIgx60cp1B2quc7q3y8');

const dominios = {
  "infobae.com": "Infobae",
  "lanacion.com.ar": "La Nación",
  "ambito.com": "Ámbito",
  "losandes.com.ar": "Los Andes",
  "clarin.com": "Clarín",
  "cronista.com": "El Cronista",
  "tn.com.ar": "TN",
  "puntal.com.ar": "Puntal",
  "eldoce.tv": "El Doce",
  "a24.com": "A24",
  "mdzol.com": "MDZ Online",
  "c5n.com": "C5N",
  "ellitoral.com": "El Litoral",
  "airedesantafe.com.ar": "Aire de Santa Fe",
  "eltribuno.com": "El Tribuno",
  "lacapital.com.ar": "La Capital",
  "cuarto.com.ar": "Cuarto",
  "elsol.com.ar": "El Sol",
  "www.elsol.com.ar": "El Sol",
  "rionegro.com.ar": "Río Negro",
  "diariodecuyo.com.ar": "Diario de Cuyo",
  "elancasti.com.ar": "El Ancasti",
  "diarioveloz.com": "Diario Veloz",
  "informatesalta.com.ar": "Infórmate Salta",
  "radiomitre.cienradios.com": "Radio Mitre",
  "ciudadano.news": "Ciudadano News",
};

function extraerFuenteDelURL(url) {
  if (!url) return "Desconocido";

  // Limpiar URL (puede empezar con =)
  url = url.replace(/^=/, '').trim();

  for (const [dominio, fuente] of Object.entries(dominios)) {
    if (url.includes(dominio)) {
      return fuente;
    }
  }

  return "Desconocido";
}

const { data } = await supabase
  .from('articulos')
  .select('id, slug, titulo, fuente, fuente_original')
  .eq('fuente', 'Desconocido');

console.log(`Encontradas ${data.length} notas con fuente "Desconocido"\n`);

let actualizadas = 0;
const cambios = {};

for (const nota of data) {
  // Intentar extraer de fuente_original primero
  let nuevaFuente = extraerFuenteDelURL(nota.fuente_original);

  // Si no, intentar de fuente
  if (nuevaFuente === 'Desconocido') {
    nuevaFuente = extraerFuenteDelURL(nota.fuente);
  }

  if (nuevaFuente !== 'Desconocido') {
    await supabase
      .from('articulos')
      .update({ fuente: nuevaFuente })
      .eq('id', nota.id);

    cambios[nuevaFuente] = (cambios[nuevaFuente] || 0) + 1;
    actualizadas++;
    console.log(`✓ ${nota.titulo.substring(0, 50)} → ${nuevaFuente}`);
  } else {
    console.log(`✗ ${nota.titulo.substring(0, 50)} → No identificada`);
  }
}

console.log(`\n--- RESUMEN ---`);
console.log(`Actualizadas: ${actualizadas} de ${data.length}`);
if (Object.keys(cambios).length > 0) {
  console.log(`\nDesglose por fuente:`);
  Object.entries(cambios)
    .sort((a, b) => b[1] - a[1])
    .forEach(([fuente, cantidad]) => {
      console.log(`  ${fuente}: ${cantidad}`);
    });
}
