// Nodo "parsear og:image" (Code, "Run Once for All Items")
// Regla: los embeds/imágenes extra SOLO se toman del cuerpo de la nota,
// nunca de la página completa (barra lateral, cabecera, pie, widgets del canal).

function acotarAlCuerpo(html) {
  const articulos = [...html.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((m) => m[0]);
  let cuerpo = '';
  let seguro = false;
  if (articulos.length) {
    cuerpo = articulos.sort((a, b) => b.length - a.length)[0];
    seguro = true;
  } else {
    cuerpo = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || '';
  }
  cuerpo = cuerpo.replace(/<(aside|footer|nav|script|style|form|noscript)\b[\s\S]*?<\/\1>/gi, '');
  return { cuerpo, seguro };
}

const VIDEO_BASURA = /player-card|twitter\.com\/i\/|live/i;

const items = [];
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];
  const html = item.json.data || '';
  const { cuerpo: cuerpoHtml, seguro } = acotarAlCuerpo(html);

  // ===== IMAGEN DE PORTADA (metadatos de la nota) =====
  const candidatos = [
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1],
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1],
    html.match(/<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1],
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']twitter:image["']/i)?.[1],
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1],
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1],
  ];

  let imagen = candidatos.find((url) => url && /^https?:\/\//i.test(url)) || null;

  if (!imagen) {
    const imgMatch = cuerpoHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && /^https?:\/\//i.test(imgMatch[1])) imagen = imgMatch[1];
  }
  if (imagen) imagen = imagen.replace(/&#0*38;|&amp;/g, '&');

  // ===== VIDEO =====
  // 1) metadatos, descartando los genéricos del canal (ej: /player-card-twitter/)
  let video_url =
    html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+name=["']twitter:player["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    null;
  if (video_url && VIDEO_BASURA.test(video_url)) video_url = null;

  // 2) iframe de YouTube / Dailymotion DENTRO del cuerpo de la nota
  if (!video_url) {
    const yt = cuerpoHtml.match(/<iframe[^>]+src=["'][^"']*youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
    const dm = cuerpoHtml.match(/<iframe[^>]+src=["'][^"']*dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/i);
    if (yt) video_url = 'https://www.youtube.com/embed/' + yt[1];
    else if (dm) video_url = 'https://www.dailymotion.com/embed/video/' + dm[1];
  }

  // ===== SALVAGUARDA GOOGLE NEWS =====
  const sinResolver = !!item.json.googleNewsSinResolver;
  if (sinResolver) {
    imagen = null;
    video_url = null;
  }
  const html2 = sinResolver ? '' : cuerpoHtml;

  // ===== IMÁGENES ADICIONALES (solo si hay un <article> claro) =====
  let imagenes_extra = [];
  if (seguro && html2) {
    imagenes_extra = [...html2.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
      .map((m) => m[1])
      .map((url) => url.replace(/width=\d+&height=\d+/, 'width=1200&height=675'))
      .filter((src) => /^https?:\/\//i.test(src))
      .filter((src) => !/logo|icon|avatar|sprite|pixel|spacer|blank\.gif|1x1|placeholder|profile|user|author|byline|headshot|thumb|sm_|_xs_/i.test(src))
      .filter((src) => {
        if (!imagen) return true;
        const a = src.split('?')[0];
        const b = imagen.split('?')[0];
        return a !== b && !a.includes(b) && !b.includes(a);
      })
      .filter((src, idx, arr) => arr.indexOf(src) === idx)
      .slice(0, 4);
  }

  // ===== TWEETS DEL CUERPO =====
  const tweets = [...html2.matchAll(/<blockquote[^>]+class=["'][^"']*twitter-tweet[^"']*["'][^>]*>([\s\S]*?)<\/blockquote>/gi)]
    .map((b) => {
      const hrefs = [...b[1].matchAll(/href=["']([^"']+)["']/gi)].map((h) => h[1]);
      return hrefs.reverse().find((h) => /status\/\d+/.test(h));
    })
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  // ===== INSTAGRAM DEL CUERPO =====
  const instagrams = [...html2.matchAll(/data-instgrm-permalink=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  // ===== PDFs / DOCUMENTOS DEL CUERPO (<object>, <embed>, <iframe>) =====
  const pdfs = [...html2.matchAll(/<(?:object|embed|iframe)[^>]+(?:data|src)=["']([^"']+\.pdf[^"']*)["']/gi)]
    .map((m) => m[1])
    .filter((u) => /^https?:\/\//i.test(u))
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .slice(0, 2);

  // ===== CONTENIDO FALLBACK (párrafos del cuerpo de la nota) =====
  let contentFallback = item.json.contentSnippet || '';
  if (!contentFallback) {
    contentFallback = [...html2.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter((p) => p.length > 50)
      .slice(0, 5)
      .join('\n\n');
  }

  items.push({
    json: {
      ...item.json,
      imagen,
      video_url,
      contentSnippet: contentFallback,
      imagenes_extra,
      tweets,
      instagrams,
      pdfs,
    },
  });
}
return items;
