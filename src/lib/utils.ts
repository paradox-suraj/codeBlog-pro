import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isAfter, subDays } from "date-fns";
import slugifyLib from "slugify";
import readingTimeLib from "reading-time";

// ─────────────────────────────────────────────────────────────────────────────
// TAILWIND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Uses clsx for conditional class logic and tailwind-merge for deduplication.
 *
 * @example cn("px-4 py-2", isActive && "bg-blue-500", "px-6") → "py-2 bg-blue-500 px-6"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// DATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a date for display in blog post cards and headers.
 * Shows relative time (e.g., "3 days ago") for recent posts,
 * and absolute date (e.g., "Jan 12, 2024") for older posts.
 *
 * @param date - A Date object or ISO date string.
 * @param options - Optional formatting override.
 */
export function formatDate(
  date: Date | string,
  options?: { relative?: boolean; pattern?: string }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const cutoff = subDays(new Date(), 7);

  if (options?.relative === true || (!options?.relative && isAfter(d, cutoff))) {
    return formatDistanceToNow(d, { addSuffix: true });
  }

  return format(d, options?.pattern ?? "MMM d, yyyy");
}

/**
 * Formats a date as a full readable string for SEO / structured data.
 * @example formatDateFull(new Date()) → "June 14, 2024"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMMM d, yyyy");
}

/**
 * Returns an ISO 8601 date string safe for use in sitemap.xml and JSON-LD.
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// READING TIME
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimates the reading time of an MDX/Markdown string.
 * Strips frontmatter and code blocks from the word count
 * before calculating at 200 WPM (developer average).
 *
 * @param content - Raw MDX or Markdown string.
 * @returns Reading time in minutes (minimum 1).
 */
export function calculateReadingTime(content: string): number {
  // Strip YAML frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/m, "");
  // Strip code fences (code doesn't contribute to read time the same way)
  const withoutCode = withoutFrontmatter.replace(/```[\s\S]*?```/g, "");

  const stats = readingTimeLib(withoutCode, { wordsPerMinute: 200 });
  return Math.max(1, Math.ceil(stats.minutes));
}

// ─────────────────────────────────────────────────────────────────────────────
// SLUGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a URL-safe, SEO-friendly slug from a given string.
 * Handles special characters, Unicode, and leading/trailing hyphens.
 *
 * @example generateSlug("Hello, World! 2024") → "hello-world-2024"
 * @example generateSlug("Async/Await in TypeScript") → "async-await-in-typescript"
 */
export function generateSlug(input: string): string {
  return slugifyLib(input, {
    lower: true,
    strict: true,      // Strip non-word characters
    trim: true,
    locale: "en",
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Appends a short unique suffix to a slug to prevent collisions.
 * Used when two posts would otherwise produce the same slug.
 *
 * @example generateUniqueSlug("hello-world") → "hello-world-k8f2"
 */
export function generateUniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${generateSlug(base)}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Truncates a string to a specified character limit, appending "…".
 * Truncates at word boundaries to avoid cutting words in half.
 *
 * @param text  - The source string.
 * @param limit - Maximum character count (default: 160 for meta descriptions).
 */
export function truncate(text: string, limit: number = 160): string {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  // Find the last space to avoid cutting mid-word
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Strips all MDX/Markdown syntax from a string and returns plain text.
 * Useful for generating search excerpts and meta descriptions.
 *
 * @param mdx - Raw MDX string.
 */
export function mdxToPlainText(mdx: string): string {
  return mdx
    .replace(/^---[\s\S]*?---\n/m, "")         // Remove frontmatter
    .replace(/```[\s\S]*?```/g, "")             // Remove code blocks
    .replace(/`[^`]*`/g, "")                    // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")            // Remove images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")      // Replace links with text
    .replace(/#{1,6}\s+/g, "")                  // Remove heading markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2") // Remove bold/italic
    .replace(/>\s+/g, "")                       // Remove blockquotes
    .replace(/[-*+]\s+/g, "")                   // Remove list markers
    .replace(/\n{2,}/g, " ")                    // Collapse newlines
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats large numbers with locale-aware compact notation.
 *
 * @example formatNumber(1234)   → "1.2K"
 * @example formatNumber(1500000) → "1.5M"
 * @example formatNumber(42)    → "42"
 */
export function formatNumber(n: number): string {
  if (n < 1000) return n.toString();
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Formats a number with thousands separators.
 * @example formatNumberFull(12345) → "12,345"
 */
export function formatNumberFull(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// URL UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the absolute URL for a given path using the NEXT_PUBLIC_APP_URL env var.
 * Falls back to localhost:3000 in development.
 *
 * @example absoluteUrl("/blog/my-post") → "https://codeblog.pro/blog/my-post"
 */
export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an array of numbers from start to end (inclusive).
 * Useful for generating pagination ranges.
 *
 * @example range(1, 5) → [1, 2, 3, 4, 5]
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Type-safe object entries with proper key typing.
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
