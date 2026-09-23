"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { slugify } from "@/lib/slugify";
import { normalizarMarkdown } from "@/lib/format";
import { subirImagen, type ResultadoGuardado } from "./nueva/actions";
import { generarFaqs } from "./nueva/generarFaqs";
import { InstagramEmbed } from "./InstagramEmbedNode";
import { TwitterEmbed } from "./TwitterEmbedNode";

declare module "@tiptap/core" {
  interface Storage {
    markdown: import("tiptap-markdown").MarkdownStorage;
  }
}

const SECCIONES = [
  "Política",
  "Economía",
  "Policiales",
  "Sociedad",
  "Espectáculos",
  "Virales",
  "Provincias",
] as const;

const paper = "#FCFAF6";
const ink = "#191512";
const inkSuave = "#8A8079";
const rojo = "#A81419";
const rule = "#DDD5C8";

export interface DatosNota {
  titulo: string;
  bajada: string;
  cuerpo: string;
  seccion: string;
  autor: string;
  slug: string;
  imagen: string;
  faqs?: Array<{ pregunta: string; respuesta: string }>;
}

type Estado = { tipo: "idle" } | { tipo: "ok"; slug: string } | { tipo: "error"; mensaje: string };

function contarPalabras(texto: string): number {
  return texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
}

function ToolbarButton({
  onClick,
  activo,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  activo?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        border: "1px solid " + (activo ? ink : rule),
        background: activo ? ink : "#fff",
        color: activo ? paper : ink,
        borderRadius: "4px",
        padding: "6px 10px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const [subiendo, setSubiendo] = useState(false);

  const agregarLink = useCallback(() => {
    if (!editor) return;
    const previa = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link:", previa ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const agregarInstagram = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL del reel/post de Instagram:", "https://www.instagram.com/reel/");
    if (!url || !url.trim()) return;

    // El endpoint de embeds de Instagram solo responde en /reel/ (singular);
    // la URL que se copia al mirar un reel en el navegador usa /reels/
    // (plural), que devuelve 404 y deja el embed invisible sin ningún error.
    const urlNormalizada = url.trim().replace(/\/reels\//, "/reel/");

    // No se usa editor.chain().insertContent(): tiptap-markdown sobrescribe
    // ese comando para parsear el contenido como texto markdown antes de
    // insertarlo, y al pasarle un nodo (no un string) lo descarta en
    // silencio. Se despacha la transacción directo, como con el paste de
    // imágenes más abajo.
    editor.chain().focus().run();
    const nodo = editor.schema.nodes.instagramEmbed.create({ url: urlNormalizada });
    const desde = editor.state.selection.from;
    editor.view.dispatch(editor.state.tr.replaceSelectionWith(nodo));
    // Sin esto, el nodo queda seleccionado como bloque y la próxima tecla
    // que se escriba lo reemplaza en vez de agregarse después.
    editor.commands.setTextSelection(desde + nodo.nodeSize);
    editor.commands.focus();
  }, [editor]);

  const agregarTwitter = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL del tweet:", "https://x.com/");
    if (!url || !url.trim()) return;

    editor.chain().focus().run();
    const nodo = editor.schema.nodes.twitterEmbed.create({ url: url.trim() });
    const desde = editor.state.selection.from;
    editor.view.dispatch(editor.state.tr.replaceSelectionWith(nodo));
    editor.commands.setTextSelection(desde + nodo.nodeSize);
    editor.commands.focus();
  }, [editor]);

  const elegirImagen = useCallback(() => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setSubiendo(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const resultado = await subirImagen(formData);
        if (resultado.ok) {
          editor.chain().focus().setImage({ src: resultado.url }).run();
        } else {
          window.alert(resultado.error);
        }
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "No se pudo subir la imagen.");
      } finally {
        setSubiendo(false);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        padding: "10px",
        background: "#F3EEE5",
        border: `1px solid ${rule}`,
        borderBottom: "none",
        borderRadius: "6px 6px 0 0",
      }}
    >
      <ToolbarButton
        title="Negrita"
        activo={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="Itálica"
        activo={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        title="Subrayado"
        activo={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton
        title="Subtítulo H2"
        activo={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Subtítulo H3"
        activo={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title="Lista"
        activo={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Lista
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        activo={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Lista
      </ToolbarButton>
      <ToolbarButton title="Link" activo={editor.isActive("link")} onClick={agregarLink}>
        🔗 Link
      </ToolbarButton>
      <ToolbarButton title="Insertar imagen" disabled={subiendo} onClick={elegirImagen}>
        {subiendo ? "Subiendo…" : "🖼 Imagen"}
      </ToolbarButton>
      <ToolbarButton title="Insertar reel de Instagram" onClick={agregarInstagram}>
        📷 Instagram
      </ToolbarButton>
      <ToolbarButton title="Insertar tweet" onClick={agregarTwitter}>
        𝕏 Twitter
      </ToolbarButton>
    </div>
  );
}

interface Props {
  valoresIniciales?: DatosNota;
  guardar: (datos: DatosNota) => Promise<ResultadoGuardado>;
  textoBoton?: string;
  mensajeExito?: string;
}

const estilosEditor = `
  .editor-content h2 {
    font-size: 23px;
    font-weight: 700;
    margin: 20px 0 12px;
    font-family: Georgia, serif;
  }
  .editor-content h3 {
    font-size: 21px;
    font-weight: 700;
    margin: 18px 0 12px;
    font-family: Georgia, serif;
  }
  .editor-content strong {
    font-weight: 700;
  }
  .editor-content em {
    font-style: italic;
  }
  .editor-content u {
    text-decoration: underline;
  }
`;

export default function NotaForm({
  valoresIniciales,
  guardar,
  textoBoton = "Guardar nota",
  mensajeExito = "Guardado.",
}: Props) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(valoresIniciales?.titulo ?? "");
  const [bajada, setBajada] = useState(valoresIniciales?.bajada ?? "");
  const [seccion, setSeccion] = useState<(typeof SECCIONES)[number]>(
    (valoresIniciales?.seccion as (typeof SECCIONES)[number]) ?? "Política"
  );
  const [autor, setAutor] = useState(valoresIniciales?.autor ?? "");
  const [slug, setSlug] = useState(valoresIniciales?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(Boolean(valoresIniciales?.slug));
  const [imagenPortada, setImagenPortada] = useState(valoresIniciales?.imagen ?? "");
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const [faqs, setFaqs] = useState(valoresIniciales?.faqs ?? []);
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  const [pending, startTransition] = useTransition();
  const [subiendoPegada, setSubiendoPegada] = useState(false);
  const [generandoFaqs, setGenerandoFaqs] = useState(false);

  function actualizarTitulo(valor: string) {
    setTitulo(valor);
    if (!slugTocado) setSlug(slugify(valor));
  }

  async function elegirImagenPortada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSubiendoPortada(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resultado = await subirImagen(formData);
      if (resultado.ok) {
        setImagenPortada(resultado.url);
      } else {
        window.alert(resultado.error);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendoPortada(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: valoresIniciales?.cuerpo ? normalizarMarkdown(valoresIniciales.cuerpo) : "",
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      InstagramEmbed,
      TwitterEmbed,
      Markdown.configure({ html: true }),
    ],
    editorProps: {
      attributes: {
        style: "min-height:320px;padding:16px;font-size:15.5px;line-height:1.6;color:" + ink,
      },
      handlePaste: (view, event) => {
        const archivos = Array.from(event.clipboardData?.items ?? [])
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);

        if (archivos.length === 0) return false;

        event.preventDefault();
        setSubiendoPegada(true);

        (async () => {
          for (const file of archivos) {
            try {
              const formData = new FormData();
              formData.append("file", file);
              const resultado = await subirImagen(formData);
              if (resultado.ok) {
                const nodo = view.state.schema.nodes.image.create({ src: resultado.url });
                view.dispatch(view.state.tr.replaceSelectionWith(nodo));
              } else {
                window.alert(resultado.error);
              }
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "No se pudo subir la imagen.");
            }
          }
          setSubiendoPegada(false);
        })();

        return true;
      },
    },
  });

  async function generarFaqsAutomaticamente() {
    if (!editor || !titulo.trim() || !bajada.trim()) {
      window.alert("Completa el título y copete para generar FAQs.");
      return;
    }

    setGenerandoFaqs(true);
    try {
      const cuerpo = editor.storage.markdown.getMarkdown();
      const nuevasFaqs = await generarFaqs(titulo.trim(), bajada.trim(), cuerpo);
      setFaqs(nuevasFaqs);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "No se pudieron generar las FAQs."
      );
    } finally {
      setGenerandoFaqs(false);
    }
  }

  async function enviar() {
    if (!editor) return;
    setEstado({ tipo: "idle" });

    const cuerpo = editor.storage.markdown.getMarkdown();

    startTransition(async () => {
      try {
        const resultado = await guardar({
          titulo: titulo.trim(),
          bajada: bajada.trim(),
          cuerpo,
          seccion,
          autor: autor.trim(),
          slug: slug.trim(),
          imagen: imagenPortada,
          faqs: faqs.length > 0 ? faqs : undefined,
        });
        if (resultado.ok) {
          setEstado({ tipo: "ok", slug: resultado.slug });
        } else {
          setEstado({ tipo: "error", mensaje: resultado.error });
        }
      } catch (error) {
        setEstado({
          tipo: "error",
          mensaje: error instanceof Error ? error.message : "Error inesperado",
        });
      }
    });
  }

  const puedeEnviar =
    titulo.trim() !== "" &&
    bajada.trim() !== "" &&
    autor.trim() !== "" &&
    slug.trim() !== "" &&
    !pending;

  const campoEstilo: React.CSSProperties = {
    width: "100%",
    fontFamily: "inherit",
    fontSize: "15px",
    color: ink,
    background: "#fff",
    border: `1px solid ${rule}`,
    borderRadius: "6px",
    padding: "10px 12px",
  };

  const labelEstilo: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    color: inkSuave,
    marginBottom: "6px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <label style={labelEstilo}>Título</label>
        <input
          style={campoEstilo}
          value={titulo}
          onChange={(e) => actualizarTitulo(e.target.value)}
          disabled={pending}
        />
      </div>

      <div>
        <label style={labelEstilo}>Slug</label>
        <input
          style={{ ...campoEstilo, fontFamily: "ui-monospace, Consolas, monospace", fontSize: "13.5px" }}
          value={slug}
          onChange={(e) => {
            setSlugTocado(true);
            setSlug(slugify(e.target.value));
          }}
          disabled={pending}
        />
      </div>

      <div>
        <label style={labelEstilo}>Copete</label>
        <textarea
          style={{ ...campoEstilo, resize: "vertical" }}
          rows={3}
          value={bajada}
          onChange={(e) => setBajada(e.target.value)}
          disabled={pending}
        />
      </div>

      <div>
        <label style={labelEstilo}>Foto de portada</label>
        {imagenPortada ? (
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL externa (Supabase Storage), no un asset local */}
            <img
              src={imagenPortada}
              alt=""
              style={{ width: "140px", height: "80px", objectFit: "cover", borderRadius: "6px", border: `1px solid ${rule}` }}
            />
            <button
              type="button"
              onClick={() => setImagenPortada("")}
              disabled={pending}
              style={{
                border: `1px solid ${rojo}`,
                color: rojo,
                background: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Quitar
            </button>
          </div>
        ) : (
          <label
            style={{
              display: "inline-block",
              border: `1px dashed ${rule}`,
              borderRadius: "6px",
              padding: "12px 16px",
              fontSize: "13px",
              color: inkSuave,
              cursor: subiendoPortada ? "not-allowed" : "pointer",
              opacity: subiendoPortada ? 0.6 : 1,
            }}
          >
            {subiendoPortada ? "Subiendo…" : "📷 Subir foto de portada"}
            <input
              type="file"
              accept="image/*"
              onChange={elegirImagenPortada}
              disabled={subiendoPortada || pending}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      <div style={{ display: "flex", gap: "18px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelEstilo}>Sección</label>
          <select
            style={campoEstilo}
            value={seccion}
            onChange={(e) => setSeccion(e.target.value as (typeof SECCIONES)[number])}
            disabled={pending}
          >
            {SECCIONES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelEstilo}>Autor</label>
          <input
            style={campoEstilo}
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={labelEstilo}>
            Cuerpo {subiendoPegada && <span style={{ color: rojo }}>· subiendo imagen…</span>}
          </label>
          <span style={{ fontSize: "11.5px", color: inkSuave }}>
            {contarPalabras(editor?.getText() ?? "")} palabras
          </span>
        </div>
        <Toolbar editor={editor} />
        <div style={{ border: `1px solid ${rule}`, borderRadius: "0 0 6px 6px", background: "#fff" }}>
          <style>{estilosEditor}</style>
          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <label style={labelEstilo}>Preguntas frecuentes (opcional)</label>
          <button
            type="button"
            onClick={generarFaqsAutomaticamente}
            disabled={generandoFaqs || pending}
            title="Genera FAQs automáticamente basadas en el contenido de la nota"
            style={{
              background: "none",
              color: rojo,
              border: `1px solid ${rojo}`,
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: generandoFaqs || pending ? "not-allowed" : "pointer",
              opacity: generandoFaqs || pending ? 0.5 : 1,
            }}
          >
            {generandoFaqs ? "Generando…" : "✨ Generar automáticamente"}
          </button>
        </div>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ marginBottom: "16px", padding: "12px", border: `1px solid ${rule}`, borderRadius: "4px" }}>
            <input
              style={{...campoEstilo, marginBottom: "8px"}}
              placeholder="Pregunta"
              value={faq.pregunta}
              onChange={(e) => {
                const nuevasFaqs = [...faqs];
                nuevasFaqs[idx].pregunta = e.target.value;
                setFaqs(nuevasFaqs);
              }}
              disabled={pending}
            />
            <textarea
              style={{...campoEstilo, minHeight: "60px", marginBottom: "8px"}}
              placeholder="Respuesta"
              value={faq.respuesta}
              onChange={(e) => {
                const nuevasFaqs = [...faqs];
                nuevasFaqs[idx].respuesta = e.target.value;
                setFaqs(nuevasFaqs);
              }}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
              disabled={pending}
              style={{
                background: "#FBEAEA",
                color: rojo,
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFaqs([...faqs, { pregunta: "", respuesta: "" }])}
          disabled={pending}
          style={{
            background: "none",
            color: rojo,
            border: `1px solid ${rojo}`,
            borderRadius: "4px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Agregar pregunta
        </button>
      </div>

      {estado.tipo === "error" && (
        <p style={{ background: "#FBEAEA", color: rojo, padding: "12px 14px", borderRadius: "4px", fontSize: "13px" }}>
          {estado.mensaje}
        </p>
      )}
      {estado.tipo === "ok" && (
        <p style={{ background: "#EAF3EA", color: "#1E5E2A", padding: "12px 14px", borderRadius: "4px", fontSize: "13px" }}>
          {mensajeExito} <a href={`/nota/${estado.slug}`} target="_blank" rel="noopener noreferrer">Verla en vivo</a>
          {" · "}
          <a href={`/admin/revisar/${estado.slug}`}>Revisarla</a>
        </p>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          disabled={!puedeEnviar}
          onClick={enviar}
          style={{
            background: rojo,
            color: paper,
            border: "none",
            borderRadius: "6px",
            padding: "12px 22px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: puedeEnviar ? "pointer" : "not-allowed",
            opacity: puedeEnviar ? 1 : 0.5,
          }}
        >
          {pending ? "Guardando…" : textoBoton}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => router.push("/admin")}
          style={{
            background: "none",
            color: ink,
            border: `1px solid ${ink}`,
            borderRadius: "6px",
            padding: "12px 22px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
