import type { VideoYouTube } from "@/types/video";

interface Props {
  videos: VideoYouTube[];
}

export default function VideoSection({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="videos" id="videos">
      <div className="vid-head">
        <h2>
          <span className="lin" /> Mirá los videos de hoy
        </h2>
      </div>
      <div className="vid-grid">
        {videos.map((video) => (
          <a
            key={video.videoId}
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vcard"
          >
            <div className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail de YouTube, dominio fijo */}
              <img src={video.thumbnail} alt="" loading="lazy" decoding="async" />
              <span className="play" />
            </div>
            <span className="canal">{video.canal}</span>
            <h3>{video.titulo}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
