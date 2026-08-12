import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE: Page
// Used for static site pages: About, Terms, Privacy Policy.
// Stored as local MDX files in src/content/pages/
// ─────────────────────────────────────────────────────────────────────────────

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: "pages/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    updatedAt: {
      type: "date",
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (page) =>
        page._raw.flattenedPath.replace(/^pages\//, ""),
    },
    url: {
      type: "string",
      resolve: (page) =>
        `/${page._raw.flattenedPath.replace(/^pages\//, "")}`,
    },
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE: Doc
// Used for platform documentation pages.
// Stored as local MDX files in src/content/docs/
// ─────────────────────────────────────────────────────────────────────────────

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: "docs/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
    order: {
      type: "number",
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) =>
        doc._raw.flattenedPath.replace(/^docs\//, ""),
    },
    url: {
      type: "string",
      resolve: (doc) =>
        `/docs/${doc._raw.flattenedPath.replace(/^docs\//, "")}`,
    },
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// CONTENTLAYER SOURCE
// Configures unified plugins for MDX transformation.
// ─────────────────────────────────────────────────────────────────────────────

export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [Page, Doc],

  mdx: {
    remarkPlugins: [
      // GitHub Flavored Markdown: tables, strikethrough, task lists
      remarkGfm,
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
            ariaLabel: "Link to section",
          },
        },
      ],

      // Shiki syntax highlighting
      [
        rehypeShiki as any,
        {
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
        },
      ],
    ],
  },
});
