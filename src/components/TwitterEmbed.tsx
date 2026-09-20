"use client";

interface Props {
  url: string;
}

export default function TwitterEmbed({ url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="tweet-card"
    >
      <span className="tweet-card-icon">𝕏</span>
      <span className="tweet-card-texto">Ver publicación en X (Twitter)</span>
    </a>
  );
}
