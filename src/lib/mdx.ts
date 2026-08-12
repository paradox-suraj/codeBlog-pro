import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import rehypeShiki from "@shikijs/rehype";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

// ─────────────────────────────────────────────────────────────────────────────
// TABLE OF CONTENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface HeadingItem {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4;
}

/**
 * Extracts headings (h1–h4) from raw MDX content for table of contents generation.
 * Returns an array of { id, text, level } objects.
 *
 * @example
 * const headings = extractHeadings("## Introduction\n### Details");
 * // [{ id: "introduction", text: "Introduction", level: 2 }, ...]
 */
export function extractHeadings(content: string): HeadingItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: HeadingItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1]!.length as 1 | 2 | 3 | 4;
    const rawText = match[2]!.trim();

    // Strip inline markdown (bold, italic, code, links) from heading text
    const text = rawText
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1");

    // Generate an id that matches rehype-slug's algorithm
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    headings.push({ id, text, level });
  }

  return headings;
}

// ─────────────────────────────────────────────────────────────────────────────
// MDX COMPILATION
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedMDX {
  content: React.ReactElement;
  frontmatter: Record<string, unknown>;
}

/**
 * Compiles a raw MDX string using next-mdx-remote/rsc.
 * This function must only be called in Server Components since it uses
 * next-mdx-remote/rsc's compileMDX which runs on the server.
 *
 * Pipeline:
 *   1. remarkGfm — GitHub Flavored Markdown (tables, strikethrough, tasklists)
 *   2. rehypeSlug — adds `id` attributes to headings
 *   3. rehypeAutolinkHeadings — wraps headings in anchor tags
 *   4. rehypeShiki — Shiki syntax highlighting (server-side, no client JS)
 *
 * @param source - Raw MDX string (post content from database)
 * @param components - Optional custom MDX component map
 */
export async function parseMDX(
  source: string,
  components?: MDXRemoteProps["components"]
): Promise<ParsedMDX> {
  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    components,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
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
          [
            rehypeShiki as any,
            {
              themes: {
                light: "github-light",
                dark: "github-dark-dimmed",
              },
              defaultColor: false,
            },
          ],
        ],
      },
    },
  });

  return { content, frontmatter };
}
