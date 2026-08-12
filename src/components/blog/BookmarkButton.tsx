"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookmarkButtonProps {
  slug: string;
  initialBookmarked: boolean;
  className?: string;
}

/**
 * Bookmark toggle button with optimistic UI.
 * Redirects to /login if the user is not authenticated.
 */
export function BookmarkButton({
  slug,
  initialBookmarked,
  className,
}: BookmarkButtonProps) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Optimistic update
    setBookmarked((prev) => !prev);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${slug}/bookmark`, { method: "POST" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json() as { bookmarked: boolean };
        setBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? "Post saved to bookmarks." : "Bookmark removed.");
      } catch {
        // Revert optimistic update
        setBookmarked(bookmarked);
        toast.error("Failed to update bookmark. Please try again.");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBookmark}
      disabled={isPending}
      className={cn(
        "transition-colors",
        bookmarked && "text-yellow-500 hover:text-yellow-600",
        !bookmarked && "text-muted-foreground hover:text-yellow-500",
        className
      )}
      aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          bookmarked && "fill-current"
        )}
      />
    </Button>
  );
}
