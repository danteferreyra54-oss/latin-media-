const items = [];
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];
  const html = item.json.data || '';

  // ===== DETECTAR Y EXTRAER IMAGEN DE PORTADA =====
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
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && /^https?:\/\//i.test(imgMatch[1])) {
      imagen = imgMatch[1];
    }
  }

  // ===== DETECTAR Y EXTRAER VIDEO =====
  let video_url = null;

  const ogVideoMatch = html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i);
  if (ogVideoMatch) video_url = ogVideoMatch[1];

  if (!video_url) {
    const twitterPlayerMatch = html.match(/<meta[^>]+name=["']twitter:player["'][^>]+content=["']([^"']+)["']/i);
    if (twitterPlayerMatch) video_url = twitterPlayerMatch[1];
  }

  if (!video_url) {
    const youtubeMatch = html.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) video_url = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  if (!video_url) {
    const vimeoMatch = html.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) video_url = `https://vimeo.com/${vimeoMatch[1]}`;
  }

  // ===== SALVAGUARDA GOOGLE NEWS =====
  if (item.json.googleNewsSinResolver) {
    imagen = null;
    video_url = null;
  }

  // ===== IMÁGENES ADICIONALES DEL CUERPO (para insertar dentro de la nota) =====
  let imagenes_extra = [];
  if (!item.json.googleNewsSinResolver) {
    imagenes_extra = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
      .map((m) => m[1])
      .filter((src) => /^https?:\/\//i.test(src))
      .filter((src) => !/logo|icon|avatar|sprite|pixel|spacer|blank\.gif|1x1|placeholder/i.test(src))
      .filter((src) => src !== imagen)
      .filter((src, idx, arr) => arr.indexOf(src) === idx)
      .slice(0, 4);
  }

  // ===== TWEETS EMBEBIDOS (todos, no solo el primero) =====
  const tweetBlocks = [...html.matchAll(/<blockquote[^>]+class=["'][^"']*twitter-tweet[^"']*["'][^>]*>([\s\S]*?)<\/blockquote>/gi)];
  const tweets = tweetBlocks
    .map((b) => {
      const hrefs = [...b[1].matchAll(/href=["']([^"']+)["']/gi)].map((h) => h[1]);
      return hrefs.reverse().find((h) => /status\/\d+/.test(h));
    })
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // ===== POSTS DE INSTAGRAM EMBEBIDOS =====
  const instagrams = [...html.matchAll(/data-instgrm-permalink=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // ===== CONTENIDO FALLBACK =====
  let contentFallback = item.json.contentSnippet || '';
  if (!contentFallback) {
    const parrafos = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(p => p.length > 50)
      .slice(0, 5)
      .join('\n\n');
    contentFallback = parrafos;
  }

  const tweetMatch = html.match(/<blockquote[^>]+class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/i);
  const tweetEmbed = tweetMatch ? tweetMatch[0] : '';
  if (tweetEmbed) {
    contentFallback = contentFallback + '\n\n[EMBED_TWEET]\n' + tweetEmbed + '\n[/EMBED_TWEET]';
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
    }
  });
}
return items;
