"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LikeButtonProps {
  slug: string;
  initialCount: number;
  initialLiked: boolean;
  className?: string;
}

/**
 * Animated heart like button with optimistic UI update.
 * Redirects to /login if the user is not authenticated.
 */
export function LikeButton({
  slug,
  initialCount,
  initialLiked,
  className,
}: LikeButtonProps) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Optimistic update
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);
    setLiked(nextLiked);
    setCount(nextCount);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${slug}/like`, { method: "POST" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json() as { liked: boolean; count: number };
        setLiked(data.liked);
        setCount(data.count);
      } catch {
        // Revert optimistic update
        setLiked(liked);
        setCount(count);
        toast.error("Failed to update like. Please try again.");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        liked && "text-rose-500 hover:text-rose-600",
        !liked && "text-muted-foreground hover:text-rose-500",
        className
      )}
      aria-label={liked ? `Unlike — ${count} likes` : `Like — ${count} likes`}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform",
          liked && "fill-current",
          isAnimating && "scale-125"
        )}
      />
      <span className="text-sm tabular-nums">{count}</span>
    </Button>
  );
}
