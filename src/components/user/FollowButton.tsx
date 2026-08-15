"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing: boolean;
  className?: string;
}

export function FollowButton({ authorId, initialIsFollowing, className }: FollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    if (!session) {
      toast.error("Please sign in to follow authors.");
      return;
    }

    if (session.user?.id === authorId) {
      toast.error("You cannot follow yourself.");
      return;
    }

    setIsLoading(true);
    const prevStatus = isFollowing;
    setIsFollowing(!prevStatus); // Optimistic UI

    try {
      const res = await fetch(`/api/users/${authorId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update follow status");
      }

      toast.success(isFollowing ? "Unfollowed author" : "Following author");
    } catch (error) {
      setIsFollowing(prevStatus); // Revert on failure
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.id === authorId) {
    return null; // Don't show follow button for self
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`rounded-full font-semibold ${className}`}
      onClick={toggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
