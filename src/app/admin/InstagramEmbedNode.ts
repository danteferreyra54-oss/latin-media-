import { Node, mergeAttributes } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { MarkdownSerializerState } from "prosemirror-markdown";

/**
 * Nodo atómico para incrustar un reel/post de Instagram dentro del cuerpo.
 * Se guarda en el markdown como un bloque de código con lenguaje "instagram"
 * (```instagram\nURL\n```) para viajar sin romper nada por el pipeline
 * markdown existente. En /nota/[slug] se intercepta ese bloque y se
 * reemplaza por el embed real (ver InstagramEmbed.tsx).
 */
export const InstagramEmbed = Node.create({
  name: "instagramEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: null as string | null, rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        priority: 100,
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const code = dom.querySelector("code.language-instagram");
          if (!code) return false;
          return { url: (code.textContent || "").trim() };
        },
      },
      {
        tag: "div[data-instagram-embed]",
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return { url: dom.getAttribute("data-instagram-embed") };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-instagram-embed": node.attrs.url,
        class: "instagram-embed-placeholder",
      }),
      `📷 Reel de Instagram — ${node.attrs.url}`,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          state.write("```instagram\n");
          state.text(String(node.attrs.url || ""), false);
          state.ensureNewLine();
          state.write("```");
          state.closeBlock(node);
        },
      },
    };
  },
});
