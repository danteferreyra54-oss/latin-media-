const items = [];
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];
  const urlRawSucia = item.json.link || item.json.guid || '';
  // Google News / algunos feeds a veces mandan la URL con un "=" pegado adelante
  // (ej: "=https://www.elsol.com.ar/..."), lo que rompe new URL() más abajo.
  const urlRaw = urlRawSucia.replace(/^=+/, '').replace(/^["']+|["']+$/g, '').trim();

  const raw = item.json.text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const clean = jsonMatch ? jsonMatch[0] : '{}';
  const parsed = JSON.parse(clean);

  const titular_final = parsed.titular || parsed.title || item.json.title || item.json.guid || 'Sin título';
  const slug = titular_final
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  items.push({
    json: {
      title: item.json.title,
      fecha: new Date().toISOString(),
      link: urlRaw,
      contentSnippet: item.json.contentSnippet,
      guid: item.json.guid || item.json.title,
      pubDate: item.json.pubDate,
      seccion: item.json.seccion,
      publicar: item.json.publicar,
      topic_key: item.json.topic_key ?? null,
      titular: titular_final,
      copete: parsed.copete || parsed.bajada || '',
      provincia: parsed.provincia || null,
      cuerpo: parsed.cuerpo || '',
      cuerpo_corto: (parsed.cuerpo || '').substring(0, 1900),
      imagen: item.json.imagen ?? null,
      video_url: item.json.video_url ?? null,
      fuente_nombre: (() => {
        const url = urlRaw;
        const mapaDominios = {
          'puntal.com.ar': 'Puntal',
          'eldoce.tv': 'El Doce',
          'a24.com': 'A24',
          'mdzol.com': 'MDZ Online',
          'c5n.com': 'C5N',
          'ellitoral.com': 'El Litoral',
          'airedesantafe.com.ar': 'Aire de Santa Fe',
          'eltribuno.com': 'El Tribuno',
          'lacapital.com.ar': 'La Capital',
          'cuarto.com.ar': 'Cuarto',
          'infobae.com': 'Infobae',
          'lanacion.com.ar': 'La Nación',
          'ambito.com': 'Ámbito',
          'losandes.com.ar': 'Los Andes',
          'clarin.com': 'Clarín',
          'cronista.com': 'El Cronista',
          'tn.com.ar': 'TN',
          'elsol.com.ar': 'El Sol',
          'rionegro.com.ar': 'Río Negro',
          'diariodecuyo.com.ar': 'Diario de Cuyo',
          'elancasti.com.ar': 'El Ancasti',
          'diarioveloz.com': 'Diario Veloz',
          'informatesalta.com.ar': 'Infórmate Salta',
          'radiomitre.cienradios.com': 'Radio Mitre',
          'ciudadano.news': 'Ciudadano News',
        };
        for (const [dominio, nombre] of Object.entries(mapaDominios)) {
          if (url.includes(dominio)) return nombre;
        }
        try {
          const urlObj = new URL(url);
          const dominio = urlObj.hostname.replace(/^www\./, '');
          return dominio.charAt(0).toUpperCase() + dominio.slice(1);
        } catch {
          return 'Desconocido';
        }
      })(),
      slug: slug,
      faqs: parsed.faqs || [],
      // recursos multimedia detectados en la fuente original (ver "parsear og:image")
      imagenes_extra: item.json.imagenes_extra || [],
      tweets: item.json.tweets || [],
      instagrams: item.json.instagrams || [],
    }
  });
}
return items;
