"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: { widgets: { load: () => void } };
  }
}

interface Props {
  url: string;
}

/** Incrusta un tweet vía el script oficial de X/Twitter. */
export default function TwitterEmbed({ url }: Props) {
  useEffect(() => {
    function procesar() {
      window.twttr?.widgets.load();
    }

    if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      procesar();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = procesar;
    document.body.appendChild(script);
  }, [url]);

  return (
    <blockquote
      className="twitter-tweet"
      data-conversation="none"
      style={{ margin: "28px auto", maxWidth: "550px" }}
    >
      <a href={url} />
    </blockquote>
  );
}
