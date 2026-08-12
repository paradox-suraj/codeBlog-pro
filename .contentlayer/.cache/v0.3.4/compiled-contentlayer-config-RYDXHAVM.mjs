// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { rehypeShikiFromHighlighter } from "@shikijs/rehype";
import { createHighlighter } from "shiki";
var Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: "pages/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    description: {
      type: "string",
      required: true
    },
    updatedAt: {
      type: "date",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (page) => page._raw.flattenedPath.replace(/^pages\//, "")
    },
    url: {
      type: "string",
      resolve: (page) => `/${page._raw.flattenedPath.replace(/^pages\//, "")}`
    }
  }
}));
var Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: "docs/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    description: {
      type: "string",
      required: false
    },
    order: {
      type: "number",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^docs\//, "")
    },
    url: {
      type: "string",
      resolve: (doc) => `/docs/${doc._raw.flattenedPath.replace(/^docs\//, "")}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "src/content",
  documentTypes: [Page, Doc],
  mdx: {
    remarkPlugins: [
      // GitHub Flavored Markdown: tables, strikethrough, task lists
      remarkGfm
    ],
    rehypePlugins: [
      // Add `id` attributes to all headings for anchor links
      rehypeSlug,
      // Wrap each heading in an anchor tag for clickable #links
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["anchor"],
            ariaLabel: "Link to section"
          }
        }
      ],
      // Shiki syntax highlighting — runs server-side, zero JS to the client.
      // Note: createHighlighter is async, so we use a factory pattern.
      async () => {
        const highlighter = await createHighlighter({
          themes: ["github-light", "github-dark"],
          langs: [
            "typescript",
            "javascript",
            "tsx",
            "jsx",
            "css",
            "html",
            "json",
            "bash",
            "sh",
            "sql",
            "prisma",
            "markdown",
            "mdx",
            "yaml",
            "toml",
            "rust",
            "go",
            "python",
            "dockerfile"
          ]
        });
        return rehypeShikiFromHighlighter(highlighter, {
          themes: {
            light: "github-light",
            dark: "github-dark"
          },
          defaultLanguage: "text"
        });
      }
    ]
  }
});
export {
  Doc,
  Page,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-RYDXHAVM.mjs.map
