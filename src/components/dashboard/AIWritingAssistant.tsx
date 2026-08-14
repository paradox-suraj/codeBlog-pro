"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AIWritingAssistantProps {
  onApplyContent: (newContent: string) => void;
  currentContent: string;
}

export function AIWritingAssistant({ onApplyContent, currentContent }: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<string>("improve");
  const [suggestion, setSuggestion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!currentContent && action === "improve") {
      toast.error("Add some content first to improve it.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          textToImprove: currentContent,
          messages: [{ role: "user", content: `Please ${action} the following text:\n\n${currentContent}` }]
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        // Clean out any 0: prefix that Vercel AI SDK might send in data stream if parsing manually,
        // but since we aren't using useChat here, we should actually just read the text. 
        // Vercel's streamText outputs text chunks directly if it's text stream, but toDataStreamResponse outputs a specific protocol.
        // If we want raw text, we should have used .toTextStreamResponse() on backend.
        // Let's parse the protocol naively or just assume it's data stream.
        // The Vercel data stream format prepends `0:` to text chunks.
        const lines = chunkValue.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            text += JSON.parse(line.substring(2));
          }
        }
        setSuggestion(text);
      }
    } catch (err) {
      toast.error("Failed to generate AI suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border-2 border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Writing Assistant
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Hide" : "Show"}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improve">Improve Writing</SelectItem>
                <SelectItem value="fix grammar">Fix Grammar</SelectItem>
                <SelectItem value="expand">Expand Section</SelectItem>
                <SelectItem value="simplify">Simplify</SelectItem>
                <SelectItem value="generate outline">Generate Outline</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={loading} variant="secondary">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </div>

          {suggestion && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">AI Suggestion</div>
              <Textarea 
                value={suggestion} 
                readOnly 
                className="min-h-[150px] resize-y font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => { onApplyContent(suggestion); setSuggestion(""); }}>
                  <Check className="mr-2 h-4 w-4" /> Apply Changes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSuggestion("")}>
                  <X className="mr-2 h-4 w-4" /> Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
