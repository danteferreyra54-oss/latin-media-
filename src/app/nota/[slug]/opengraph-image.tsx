import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nota de Latin Media";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #FCFAF6 0%, #F3EEE5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        fontFamily: "Georgia, serif",
        color: "#191512",
      }}
    >
      <div
        style={{
          fontSize: "72px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#A81419",
        }}
      >
        LM
      </div>
      <div
        style={{
          fontSize: "56px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "30px",
          color: "#191512",
        }}
      >
        Latin Media
      </div>
      <div
        style={{
          fontSize: "28px",
          color: "#8A8079",
          textAlign: "center",
        }}
      >
        Noticias de todo el país
      </div>
    </div>,
    { ...size }
  );
}
