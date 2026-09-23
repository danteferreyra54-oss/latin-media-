"use client";

interface Props {
  url: string;
}

/** El endpoint de embeds de Instagram sólo responde en /reel/ (singular) y
 * /p/; la URL que se ve al mirar un reel en el navegador usa /reels/
 * (plural), que devuelve 404 en .../embed/. Se normaliza acá para no
 * depender de que se pegue el formato exacto. */
function normalizarPermalink(url: string): string {
  return url.replace(/\/reels\//, "/reel/").replace(/\/?$/, "");
}

/**
 * Incrusta un post/reel de Instagram con un iframe directo a su página de embed.
 * Antes se usaba el script oficial de Instagram (embed.js), que arma un <blockquote>
 * y después lo convierte en iframe ajustando la altura con un mensaje de ida y
 * vuelta con instagram.com. Ese paso de ajuste falla seguido (deja el embed en
 * blanco, o solo una línea, sin ningún error visible) y no depende del sitio.
 * El iframe de acá apunta directo a la página de Instagram: no necesita ese script
 * ni su ajuste de altura para mostrar el contenido.
 */
export default function InstagramEmbed({ url: urlOriginal }: Props) {
  const url = normalizarPermalink(urlOriginal);

  return (
    <div style={{ margin: "28px auto", maxWidth: "540px" }}>
      <iframe
        src={`${url}/embed/captioned/`}
        title="Publicación de Instagram"
        loading="lazy"
        allowFullScreen
        style={{
          width: "100%",
          height: "780px",
          border: "1px solid #DDD5C8",
          borderRadius: "4px",
          display: "block",
        }}
      />
    </div>
  );
}
