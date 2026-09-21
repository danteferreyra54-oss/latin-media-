const items = [];
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];
  const html = item.json.data || '';

  // ===== DETECTAR Y EXTRAER IMAGEN =====
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
  // Si "resolver google news" no logró decodificar el link, el HTML scrapeado
  // es el de la página intermedia de Google, no el del medio real. Invalidamos
  // su imagen para no publicar el logo genérico de Google News.
  if (item.json.googleNewsSinResolver) {
    imagen = null;
    video_url = null;
  }

  // ===== TWEETS EMBEBIDOS =====
  const tweetMatch = html.match(/<blockquote[^>]+class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/i);
  const tweetEmbed = tweetMatch ? tweetMatch[0] : '';

  // ===== INSTAGRAM EMBEBIDO =====
  // Busca el blockquote estándar que Instagram genera para sus embeds y
  // saca la URL del permalink (atributo data-instgrm-permalink), que es
  // el mismo formato que espera el frontend (InstagramEmbedNode.ts).
  let instagramUrl = null;
  const instaBlockquote = html.match(/<blockquote[^>]+class="instagram-media"[^>]*>[\s\S]*?<\/blockquote>/i)?.[0];
  if (instaBlockquote) {
    const permalinkMatch = instaBlockquote.match(/data-instgrm-permalink=["']([^"']+)["']/i);
    if (permalinkMatch) {
      instagramUrl = permalinkMatch[1].split('?')[0];
    }
  }
  if (!instagramUrl) {
    const instaLinkMatch = html.match(/https:\/\/www\.instagram\.com\/(?:p|reel)\/[a-zA-Z0-9_-]+\/?/i);
    if (instaLinkMatch) instagramUrl = instaLinkMatch[0];
  }

  // ===== IMÁGENES DENTRO DEL CUERPO =====
  // Además de la imagen destacada (og:image), buscamos otras <img> del
  // artículo para que el Redactor pueda intercalarlas en el cuerpo.
  // Filtramos logos/iconos/avatares/publicidad por palabras clave típicas
  // y descartamos duplicados de la imagen destacada.
  const RUIDO_IMAGEN = /(logo|icon|avatar|sprite|pixel|tracking|banner|\bads?\b|social|share|placeholder|spinner|loading)/i;
  const imagenesCuerpo = [];
  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  for (const m of imgMatches) {
    const url = m[1];
    if (!url || !/^https?:\/\//i.test(url)) continue;
    if (url === imagen) continue;
    if (RUIDO_IMAGEN.test(url)) continue;
    if (!/\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url)) continue;
    if (imagenesCuerpo.includes(url)) continue;
    imagenesCuerpo.push(url);
    if (imagenesCuerpo.length >= 2) break; // máximo 2 imágenes extra por nota
  }

  if (item.json.googleNewsSinResolver) {
    instagramUrl = null;
    imagenesCuerpo.length = 0;
  }

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

  if (tweetEmbed) {
    contentFallback = contentFallback + '\n\n[EMBED_TWEET]\n' + tweetEmbed + '\n[/EMBED_TWEET]';
  }

  if (instagramUrl) {
    contentFallback = contentFallback + '\n\n[EMBED_INSTAGRAM]\n' + instagramUrl + '\n[/EMBED_INSTAGRAM]';
  }

  for (const url of imagenesCuerpo) {
    contentFallback = contentFallback + '\n\n[IMG_CUERPO]\n' + url + '\n[/IMG_CUERPO]';
  }

  items.push({
    json: {
      ...item.json,
      imagen,
      video_url,
      contentSnippet: contentFallback
    }
  });
}
return items;
