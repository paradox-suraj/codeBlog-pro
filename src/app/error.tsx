"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertOctagon, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-secondary shadow-lg">
          <AlertOctagon className="h-16 w-16 text-destructive" />
        </div>
      </motion.div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
      >
        Something went wrong!
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-lg text-muted-foreground mb-10 max-w-[500px]"
      >
        We&apos;ve encountered an unexpected error. Our team has been notified. Let&apos;s try refreshing the page.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button onClick={() => reset()} size="lg" className="rounded-full px-8 font-semibold shadow-md gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </motion.div>
    </div>
  );
}
