"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-[32px] bg-card/50"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6 shadow-sm">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full px-8 font-semibold shadow-md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
