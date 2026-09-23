"use client";

import { useEffect, useRef } from "react";

interface Props {
  url: string;
}

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: Element | null) => void } };
  }
}

function normalizarUrlTweet(url: string): string {
  const m = url.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([^/?#]+)\/status\/(\d+)/i);
  return m ? `https://twitter.com/${m[1]}/status/${m[2]}` : url;
}

export default function TwitterEmbed({ url }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const href = normalizarUrlTweet(url);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let intentos = 0;
    const timer = setInterval(() => {
      const widgets = window.twttr?.widgets;
      if (widgets) {
        widgets.load(el);
        clearInterval(timer);
      } else if (++intentos > 50) {
        clearInterval(timer);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [href]);

  return (
    <div ref={ref} style={{ margin: "1.5rem 0" }}>
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={href}>Ver publicación en X (Twitter)</a>
      </blockquote>
    </div>
  );
}
