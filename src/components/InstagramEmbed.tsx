"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

interface Props {
  url: string;
}

/** El endpoint de embeds de Instagram sólo responde en /reel/ (singular) y
 * /p/; la URL que se ve al mirar un reel en el navegador usa /reels/
 * (plural), que devuelve 404 en .../embed/ y deja el iframe con height:0
 * (invisible, sin ningún error visible). Se normaliza acá para no depender
 * de que se pegue el formato exacto. */
function normalizarPermalink(url: string): string {
  return url.replace(/\/reels\//, "/reel/");
}

/** Incrusta un post/reel de Instagram vía su script oficial de oEmbed. */
export default function InstagramEmbed({ url: urlOriginal }: Props) {
  const url = normalizarPermalink(urlOriginal);

  useEffect(() => {
    function procesar() {
      window.instgrm?.Embeds.process();
    }

    if (document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      procesar();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = procesar;
    document.body.appendChild(script);
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ margin: "28px auto", maxWidth: "540px", minWidth: "326px" }}
    />
  );
}
