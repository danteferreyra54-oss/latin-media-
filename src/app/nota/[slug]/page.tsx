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
import { getArticuloPorSlug, getNotasRelacionadas } from "@/lib/articles";
import { formatFechaLarga, formatNombreFuente, normalizarMarkdown } from "@/lib/format";
import { SECCION_HREF } from "@/lib/nav";
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
    return <img src={src} alt={alt ?? ""} style={{ maxWidth: "100%", height: "auto" }} />;
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

    return <pre>{children}</pre>;
  },
};

export default async function NotaPage({ params }: Props) {
  const { slug } = await params;
  const articulo = await getArticuloPorSlug(slug);

  if (!articulo) {
    notFound();
  }

  const relacionadas = await getNotasRelacionadas(articulo.seccion, articulo.slug);
  let cuerpoMarkdown = normalizarMarkdown(articulo.cuerpo);

  if (/^https?:\/\//i.test(articulo.imagen)) {
    const imagenRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${articulo.imagen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\n?`, 'm');
    cuerpoMarkdown = cuerpoMarkdown.replace(imagenRegex, '');
  }

  const youtubeId = articulo.video_url ? extraerYoutubeId(articulo.video_url) : null;
  const dailymotionId = !youtubeId && articulo.video_url ? extraerDailymotionId(articulo.video_url) : null;
  const faqs = articulo.faqs ?? [];

  return (
    <>
      <SiteHeader />

      <main key={articulo.slug} className="page-fade">
        <article className="nota">
          <div className="wrap nota-wrap">
            <div className="kicker">
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


            <div className="nota-cuerpo">
              {cuerpoMarkdown ? (
                <ReactMarkdown components={componentesMarkdown}>{cuerpoMarkdown}</ReactMarkdown>
              ) : (
                <p className="nota-cuerpo-vacio">Todavía no hay cuerpo cargado para esta nota.</p>
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
                      <div className="kicker">{nota.kicker}</div>
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
