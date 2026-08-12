"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  className?: string;
  inputClassName?: string;
  buttonLabel?: string;
  compact?: boolean;
}

export function NewsletterForm({
  className,
  inputClassName,
  buttonLabel = "Subscribe",
  compact = false,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not subscribe right now.");
      }

      setStatus("success");
      setEmail("");
      toast.success(data.message ?? "You're subscribed.");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not subscribe right now.";
      setError(message);
      setStatus("idle");
      toast.error(message);
    }
  };

  if (status === "success" && !compact) {
    return (
      <div className={cn("rounded-lg border bg-background/70 p-4", className)}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          You are on the list.
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Watch your inbox for the next editorial digest.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-2", className)}>
      <div className={cn("flex gap-2", compact && "items-center")}>
        <label className="sr-only" htmlFor={emailId}>
          Email address
        </label>
        <Input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={cn("bg-background", inputClassName)}
          required
          disabled={status === "loading"}
        />
        <Button
          type="submit"
          size={compact ? "icon" : "default"}
          disabled={status === "loading"}
          aria-label={compact ? "Subscribe to newsletter" : undefined}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : compact ? (
            <Send className="h-4 w-4" />
          ) : (
            <>
              {buttonLabel}
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
