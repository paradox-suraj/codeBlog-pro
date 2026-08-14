"use client";

import { useState, useEffect } from "react";

import { Bot, X, Maximize2, Minimize2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AICopilotProps {
  postId?: string; // If provided, context is strictly the article
  role?: string;
}

export function AICopilot({ postId, role = "ANONYMOUS" }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoint = role === "ADMIN" && !postId ? "/api/ai/admin" : "/api/ai/chat";

  const appendMessage = async (msg: { role: string; content: string }) => {
    if (!msg.content.trim()) return;
    
    const newMessages = [...messages, msg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, messages: newMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMessage = "";

      // Add placeholder for assistant
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          assistantMessage += decoder.decode(value, { stream: true });
          
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = assistantMessage;
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    appendMessage({ role: "user", content: input });
    setInput("");
  };

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        appendMessage({ role: "user", content: customEvent.detail.prompt });
      }
    };
    window.addEventListener("open-ai-copilot", handleOpen);
    return () => window.removeEventListener("open-ai-copilot", handleOpen);
  }, [messages]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 z-50 p-0 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        }}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-xl border bg-background shadow-2xl transition-all duration-300 ease-in-out",
        isExpanded ? "h-[80vh] w-[90vw] md:w-[800px]" : "h-[600px] w-[380px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold">CodeBlog AI</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-muted-foreground mt-20">
            <Bot className="h-12 w-12 text-muted-foreground/50" />
            <p>
              {postId
                ? "Ask me anything about this article!"
                : role === "ADMIN"
                ? "Ask me about platform analytics!"
                : "Hi! How can I help you today?"}
            </p>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {postId && (
                <>
                  <Button variant="outline" size="sm" onClick={() => appendMessage({ role: "user", content: "Summarize this article." })}>Summarize</Button>
                  <Button variant="outline" size="sm" onClick={() => appendMessage({ role: "user", content: "What are the key points?" })}>Key Points</Button>
                  <Button variant="outline" size="sm" onClick={() => appendMessage({ role: "user", content: "Generate a quiz from this article." })}>Generate Quiz</Button>
                </>
              )}
              {!postId && role === "ADMIN" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => appendMessage({ role: "user", content: "Show me total platform stats." })}>Platform Stats</Button>
                  <Button variant="outline" size="sm" onClick={() => appendMessage({ role: "user", content: "What are the top categories?" })}>Top Categories</Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
                     <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex w-max max-w-[85%] flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="flex space-x-1">
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-background">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask AI..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
