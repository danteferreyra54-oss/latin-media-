import type { VideoYouTube } from "@/types/video";

interface Props {
  videos: VideoYouTube[];
}

const MAXIMO = 8;

export default function HpVideos({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="hp-block hp-videos" id="videos">
      <div className="hp-block-hd">
        <h2>Mirá los videos de hoy</h2>
        <span className="hp-rule" />
      </div>
      <div className="hp-grid">
        {videos.slice(0, MAXIMO).map((video) => (
          <a
            key={video.videoId}
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hp-vcard"
          >
            <div className="hp-vthumb">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail de YouTube, dominio fijo */}
              <img src={video.thumbnail} alt="" loading="lazy" decoding="async" />
              <span className="hp-play" />
            </div>
            <span className="hp-vcanal">{video.canal}</span>
            <h3>{video.titulo}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
