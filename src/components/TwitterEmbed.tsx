"use client";

import { useEffect, useRef } from "react";

interface Props {
  url: string;
}

export default function TwitterEmbed({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        if (window.twttr?.widgets) {
          window.twttr.widgets.load(containerRef.current);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [url]);

  return (
    <div ref={containerRef} style={{ margin: "1.5rem 0" }}>
      <blockquote className="twitter-tweet" data-dnt="true">
        <p>
          <a href={url}>{url}</a>
        </p>
      </blockquote>
    </div>
  );
}
