"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/lib/mdx";

interface TableOfContentsProps {
  headings: HeadingItem[];
  className?: string;
}

/**
 * Sticky sidebar table of contents.
 * Highlights the active heading based on scroll position.
 * Supports smooth scrolling to headings.
 */
export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    },
    []
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-20% 0% -70% 0%",
      threshold: 0,
    });

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    // Set initial active heading
    if (elements[0] && !activeId) {
      setActiveId(elements[0].id);
    }

    return () => observer.disconnect();
  }, [headings, handleIntersection, activeId]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (headings.length === 0) return null;

  return (
    <nav
      className={cn(
        "space-y-1 text-sm",
        className
      )}
      aria-label="Table of contents"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "w-full rounded-sm py-1 text-left text-sm transition-colors hover:text-foreground",
                activeId === heading.id
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
