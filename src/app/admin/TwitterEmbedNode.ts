import { Node, mergeAttributes } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { MarkdownSerializerState } from "prosemirror-markdown";

/**
 * Nodo atómico para incrustar un tweet/X dentro del cuerpo.
 * Se guarda en el markdown como un bloque de código con lenguaje "twitter"
 * (```twitter\nURL\n```) para viajar sin romper nada por el pipeline
 * markdown existente. En /nota/[slug] se intercepta ese bloque y se
 * reemplaza por el embed real (ver TwitterEmbed.tsx).
 */
export const TwitterEmbed = Node.create({
  name: "twitterEmbed",
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
          const code = dom.querySelector("code.language-twitter");
          if (!code) return false;
          return { url: (code.textContent || "").trim() };
        },
      },
      {
        tag: "div[data-twitter-embed]",
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return { url: dom.getAttribute("data-twitter-embed") };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-twitter-embed": node.attrs.url,
        class: "twitter-embed-placeholder",
      }),
      `𝕏 Tweet — ${node.attrs.url}`,
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          state.write("```twitter\n");
          state.text(String(node.attrs.url || ""), false);
          state.ensureNewLine();
          state.write("```");
          state.closeBlock(node);
        },
      },
    };
  },
});
