"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamically import MDEditor with SSR disabled to prevent hydration mismatch
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full animate-pulse rounded-3xl bg-secondary/30 border-2 border-border flex items-center justify-center">
      <span className="text-muted-foreground font-medium">Loading Editor...</span>
    </div>
  ),
});

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MDXEditor({ value, onChange, className }: MDXEditorProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-3xl border-2 border-border shadow-sm", className)} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={600}
        preview="live"
        hideToolbar={false}
        className="w-full !border-none !rounded-3xl !font-sans overflow-hidden"
        textareaProps={{
          placeholder: "Write your incredible post here...",
        }}
      />
    </div>
  );
}
