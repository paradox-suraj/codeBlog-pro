"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, FileText, BrainCircuit, GraduationCap } from "lucide-react";

export function ArticleActions() {
  const openCopilot = (prompt?: string) => {
    window.dispatchEvent(
      new CustomEvent("open-ai-copilot", {
        detail: { prompt },
      })
    );
  };

  return (
    <div className="my-8 rounded-xl border bg-muted/30 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="font-semibold text-lg">AI Actions</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => openCopilot("Summarize this article for me.")}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Summarize
        </Button>
        <Button
          variant="secondary"
          onClick={() => openCopilot("What are the key takeaways from this article?")}
          className="gap-2"
        >
          <BrainCircuit className="h-4 w-4" />
          Key Points
        </Button>
        <Button
          variant="secondary"
          onClick={() => openCopilot("Generate a short quiz based on this article.")}
          className="gap-2"
        >
          <GraduationCap className="h-4 w-4" />
          Quiz Me
        </Button>
        <Button
          variant="outline"
          onClick={() => openCopilot()}
        >
          Ask a Question
        </Button>
      </div>
    </div>
  );
}
