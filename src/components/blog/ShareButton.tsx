"use client";

import { useState } from "react";
import { Check, Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  slug: string;
  url: string;
  initialShares: number;
}

export function ShareButton({ slug, url, initialShares }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shares, setShares] = useState(initialShares);

  const handleShare = async () => {
    try {
      // First try native share if available
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: url,
        });
        trackShare();
        return;
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      trackShare();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error("Could not share the link.");
      }
    }
  };

  const trackShare = async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares);
      }
    } catch (error) {
      console.error("Failed to track share", error);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className={cn("flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-primary")}
      aria-label="Share article"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share className="h-4 w-4" />}
      <span className="text-sm tabular-nums">{shares}</span>
    </Button>
  );
}
