// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
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
      // Shiki syntax highlighting
      [
        rehypeShiki,
        {
          themes: {
            light: "github-light",
            dark: "github-dark"
          },
          defaultColor: false
        }
      ]
    ]
  }
});
export {
  Doc,
  Page,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-47HAAOCM.mjs.map
