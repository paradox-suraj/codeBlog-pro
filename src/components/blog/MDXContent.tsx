import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { parseMDX } from "@/lib/mdx";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MDX COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Callout({
  type = "note",
  children,
}: {
  type?: "note" | "tip" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    tip: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  };
  const icons = { note: "ℹ️", tip: "💡", warning: "⚠️", danger: "🚨" };

  return (
    <div className={cn("my-6 rounded-lg border-l-4 p-4", styles[type])}>
      <p className="mb-1 font-semibold">
        {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {number}
      </div>
      <div className="flex-1 pt-0.5">{children}</div>
    </div>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="my-6">{children}</div>;
}

const mdxComponents: MDXRemoteProps["components"] = {
  Callout,
  Step,
  Steps,
};

// ─────────────────────────────────────────────────────────────────────────────
// MDX CONTENT SERVER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface MDXContentProps {
  content: string;
  className?: string;
}

/**
 * Server Component that compiles and renders MDX content.
 * Includes custom components (Callout, Step, Steps) and Shiki highlighting.
 */
export async function MDXContent({ content, className }: MDXContentProps) {
  const { content: rendered } = await parseMDX(content, mdxComponents);

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        // Headings
        "prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Code
        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        // Pre (code blocks — Shiki handles these)
        "prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:bg-transparent prose-pre:p-0",
        // Images
        "prose-img:rounded-xl prose-img:shadow-sm",
        // Blockquote
        "prose-blockquote:border-l-primary",
        // Tables
        "prose-table:overflow-x-auto",
        className
      )}
    >
      {rendered}
    </div>
  );
}
