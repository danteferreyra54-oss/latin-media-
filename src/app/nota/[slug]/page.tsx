import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import ShareButton from "@/components/ShareButton";
import SocialShareRow from "@/components/SocialShareRow";
import InstagramEmbed from "@/components/InstagramEmbed";
import TwitterEmbed from "@/components/TwitterEmbed";
import PdfEmbed from "@/components/PdfEmbed";
import { getArticuloPorSlug, getNotasRelacionadas } from "@/lib/articles";
import { claveFoto, formatFechaLarga, formatNombreFuente, normalizarMarkdown } from "@/lib/format";
import { SECCION_HREF } from "@/lib/nav";
import { claseSeccion } from "@/components/hp/seccionColor";
import { extraerYoutubeId, extraerDailymotionId } from "@/lib/youtube";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * El editor de admin guarda los reels de Instagram y tweets como bloques de
 * código ```instagram\nURL\n``` y ```twitter\nURL\n``` (ver InstagramEmbedNode.ts
 * y TwitterEmbedNode.ts) para no romper el pipeline markdown. Acá se interceptan
 * esos bloques puntuales y se reemplazan por los embeds reales; cualquier otro
 * bloque de código se muestra normal.
 */
const DOMINIOS_IGNORAR = ["twimg.com", "twitter.com", "x.com/i/", "abs.twimg"];

const componentesMarkdown: Components = {
  img({ src, alt }) {
    if (!src || typeof src !== "string") return null;
    if (DOMINIOS_IGNORAR.some((d) => src.includes(d))) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} referrerPolicy="no-referrer" style={{ maxWidth: "100%", height: "auto" }} />;
  },
  pre({ children }) {
    const hijo = Array.isArray(children) ? children[0] : children;
    const props =
      hijo && typeof hijo === "object" && "props" in hijo
        ? (hijo.props as { className?: string; children?: unknown })
        : undefined;

    if (props?.className?.includes("language-instagram")) {
      const url = String(props.children ?? "").trim();
      return <InstagramEmbed url={url} />;
    }

    if (props?.className?.includes("language-twitter")) {
      const url = String(props.children ?? "").trim();
      return <TwitterEmbed url={url} />;
    }

    if (props?.className?.includes("language-pdf")) {
      const url = String(props.children ?? "").trim();
      return <PdfEmbed url={url} />;
    }

    return <pre>{children}</pre>;
  },
};

/**
 * El video va dentro del cuerpo, después del 3.er párrafo, y nunca pegado a la foto de
 * portada. Se corta solo entre bloques y sin partir un bloque de código (tweet, PDF...).
 * Si la nota tiene menos de 3 párrafos, el video queda al final del texto.
 */
function partirCuerpoParaVideo(markdown: string, parrafosAntes = 3): [string, string] {
  const bloques = markdown.split(/\n{2,}/);
  let parrafos = 0;
  let dentroDeCodigo = false;

  for (let i = 0; i < bloques.length; i++) {
    const bloque = bloques[i].trim();
    const vallas = (bloque.match(/```/g) ?? []).length;
    if (vallas % 2 === 1) dentroDeCodigo = !dentroDeCodigo;
    if (dentroDeCodigo || vallas > 0) continue;
    if (/^(#|!\[)/.test(bloque)) continue;

    parrafos++;
    if (parrafos === parrafosAntes) {
      return [bloques.slice(0, i + 1).join("\n\n"), bloques.slice(i + 1).join("\n\n")];
    }
  }
  return [markdown, ""];
}

export default async function NotaPage({ params }: Props) {
  const { slug } = await params;
  const articulo = await getArticuloPorSlug(slug);

  if (!articulo) {
    notFound();
  }

  const relacionadas = await getNotasRelacionadas(articulo.seccion, articulo.slug);
  let cuerpoMarkdown = normalizarMarkdown(articulo.cuerpo);

  // Quitar la primera imagen del cuerpo solo si es la MISMA foto que el hero muestra arriba
  if (/^https?:\/\//i.test(articulo.imagen)) {
    const primera = cuerpoMarkdown.match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)\n?/);
    if (primera && claveFoto(primera[1]) === claveFoto(articulo.imagen)) {
      cuerpoMarkdown = cuerpoMarkdown.replace(primera[0], '');
    }
  }

  const youtubeId = articulo.video_url ? extraerYoutubeId(articulo.video_url) : null;
  const dailymotionId = !youtubeId && articulo.video_url ? extraerDailymotionId(articulo.video_url) : null;
  const videoDirecto =
    !youtubeId && !dailymotionId && articulo.video_url && /\.mp4(\?|#|$)/i.test(articulo.video_url)
      ? articulo.video_url
      : null;
  const hayVideo = Boolean(youtubeId || dailymotionId || videoDirecto);
  const [cuerpoAntes, cuerpoDespues] = hayVideo
    ? partirCuerpoParaVideo(cuerpoMarkdown)
    : [cuerpoMarkdown, ""];
  const faqs = articulo.faqs ?? [];

  const bloqueVideo = (
    <>
      {youtubeId && (
        <div className="nota-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={articulo.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {dailymotionId && (
        <div className="nota-video">
          <iframe
            src={`https://www.dailymotion.com/embed/video/${dailymotionId}`}
            title={articulo.titulo}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )}

      {videoDirecto && (
        <div className="nota-video-nativo">
          <video src={videoDirecto} controls playsInline preload="metadata" />
        </div>
      )}
    </>
  );

  return (
    <>
      <SiteHeader />

      <main key={articulo.slug} className="page-fade">
        <article className="nota">
          <div className="wrap nota-wrap">
            <div className={`kicker ${claseSeccion(articulo.seccion)}`}>
              <Link href={SECCION_HREF[articulo.seccion] ?? "/"}>{articulo.kicker}</Link>
            </div>
            <h1>{articulo.titulo}</h1>
            <p className="bajada">{articulo.bajada}</p>
            <div className="byline-row">
              <div className="byline">
                <strong>{articulo.autor}</strong> · {formatFechaLarga(new Date(articulo.fecha))}
              </div>
              <SocialShareRow
                titulo={articulo.titulo}
                slug={articulo.slug}
                imagen={/^https?:\/\//i.test(articulo.imagen) ? articulo.imagen : undefined}
              />
            </div>

            <PhotoPlaceholder variante={articulo.imagen} className="nota-media">
              <span className="tag">{articulo.seccion}</span>
            </PhotoPlaceholder>

            <div className="nota-cuerpo">
              {cuerpoMarkdown ? (
                <>
                  <ReactMarkdown components={componentesMarkdown}>{cuerpoAntes}</ReactMarkdown>
                  {bloqueVideo}
                  {cuerpoDespues && (
                    <ReactMarkdown components={componentesMarkdown}>{cuerpoDespues}</ReactMarkdown>
                  )}
                </>
              ) : (
                <>
                  {bloqueVideo}
                  <p className="nota-cuerpo-vacio">Todavía no hay cuerpo cargado para esta nota.</p>
                </>
              )}
            </div>

            {articulo.fuente && (
              <p className="nota-fuente">Fuente: {formatNombreFuente(articulo.fuente)}</p>
            )}

            {faqs.length > 0 && (
              <div className="nota-faqs">
                <h2 className="nota-faqs-titulo">Preguntas frecuentes</h2>
                {faqs.map((faq, i) => (
                  <div key={i} className="nota-faq">
                    <p className="nota-faq-pregunta">{faq.pregunta}</p>
                    <div className="nota-faq-respuesta-wrap">
                      <div className="nota-faq-respuesta-inner">
                        <p className="nota-faq-respuesta">{faq.respuesta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="nota-footer">
              <ShareButton titulo={articulo.titulo} slug={articulo.slug} />
            </div>
          </div>
        </article>

        {relacionadas.length > 0 && (
          <section className="sections">
            <div className="wrap">
              <div className="sec-block">
                <div className="sec-title">
                  <h2>Más de {articulo.seccion}</h2>
                  <span className="bar" />
                </div>
                <div className="grid3">
                  {relacionadas.map((nota) => (
                    <Link key={nota.slug} href={`/nota/${nota.slug}`} className="card">
                      <PhotoPlaceholder variante={nota.imagen} className="cimg" />
                      <div className={`kicker ${claseSeccion(nota.seccion)}`}>{nota.kicker}</div>
                      <h3>{nota.titulo}</h3>
                      <p>{nota.bajada}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
