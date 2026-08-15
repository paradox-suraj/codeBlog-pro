"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, List, ArrowLeft, ArrowRight } from "lucide-react";

interface SeriesNavProps {
  series: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    posts: {
      id: string;
      title: string;
      slug: string;
      seriesOrder: number | null;
    }[];
  };
  currentPostId: string;
}

export function SeriesNav({ series, currentPostId }: SeriesNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const posts = [...series.posts].sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  const currentIndex = posts.findIndex((p) => p.id === currentPostId);
  
  const currentPost = posts[currentIndex];
  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="my-8 rounded-3xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-sm font-bold tracking-wider text-primary uppercase">
              Part {currentPost?.seriesOrder || currentIndex + 1} of {posts.length} in Series
            </div>
            <h3 className="text-xl font-black text-foreground">
              {series.title}
            </h3>
            {series.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {series.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border-2 border-border transition-colors hover:bg-secondary/50"
            aria-label="Toggle series navigation"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-background p-4 border-2 border-border shadow-inner">
                {posts.map((post, i) => {
                  const isActive = post.id === currentPostId;
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className={`group flex items-start gap-3 rounded-xl p-3 transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-primary-foreground/20"
                            : "bg-secondary text-muted-foreground group-hover:bg-background"
                        }`}
                      >
                        {post.seriesOrder || i + 1}
                      </div>
                      <div className="font-medium">{post.title}</div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-4 flex items-center justify-between gap-4 border-t-2 border-border/50 pt-4">
          {previousPost ? (
            <Link
              href={`/blog/${previousPost.slug}`}
              className="group flex items-center gap-2 rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-semibold transition-all hover:border-primary hover:text-primary hover:shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <span className="hidden sm:inline">Next Part</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Series Complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
