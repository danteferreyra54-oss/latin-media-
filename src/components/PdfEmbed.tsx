interface Props {
  url: string;
}

export default function PdfEmbed({ url }: Props) {
  if (!/^https?:\/\//i.test(url)) return null;

  return (
    <figure style={{ margin: "1.5rem 0" }}>
      <iframe
        src={url}
        title="Documento adjunto"
        loading="lazy"
        style={{ width: "100%", height: "600px", border: "1px solid #DDD5C8" }}
      />
      <figcaption style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Abrir documento en una pestaña nueva
        </a>
      </figcaption>
    </figure>
  );
}
