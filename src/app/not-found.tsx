"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-secondary shadow-lg">
          <FileQuestion className="h-16 w-16 text-primary" />
        </div>
      </motion.div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-5xl font-black mb-4 tracking-tight"
      >
        404
      </motion.h2>
      
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-2xl font-bold mb-4"
      >
        Page Not Found
      </motion.h3>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-lg text-muted-foreground mb-10 max-w-[500px]"
      >
        The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button asChild size="lg" className="rounded-full px-8 font-semibold shadow-md">
          <Link href="/">Return Home</Link>
        </Button>
      </motion.div>
    </div>
  );
}
