"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface ReadingProgressProps {
  postSlug?: string;
  initialProgress?: number;
}

export function ReadingProgress({ postSlug, initialProgress = 0 }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showResume, setShowResume] = useState(initialProgress > 5);
  const progressRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(currentProgress);
      progressRef.current = currentProgress;

      if (scrollTop > 200) {
        setShowResume(false);
      }

      if (postSlug) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          fetch(`/api/posts/${postSlug}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ progress: progressRef.current }),
          }).catch(console.error);
        }, 2000);
      }
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [postSlug]);

  const handleResume = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (initialProgress / 100) * docHeight;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
    setShowResume(false);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showResume && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-5">
          <Button onClick={handleResume} className="shadow-xl rounded-full px-6 flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Resume reading at {initialProgress}%
          </Button>
        </div>
      )}
    </>
  );
}
