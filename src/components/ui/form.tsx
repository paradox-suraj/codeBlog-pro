import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Lightweight form field wrapper providing consistent spacing,
 * label rendering, and error message display.
 * Not using react-hook-form's FormProvider here because our forms
 * are simple enough to use register() directly.
 */

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

interface FormMessageProps {
  message?: string;
  variant?: "error" | "success";
  className?: string;
}

export function FormMessage({ message, variant = "error", className }: FormMessageProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "rounded-md p-3 text-sm",
        variant === "error"
          ? "border border-destructive/30 bg-destructive/10 text-destructive"
          : "border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
        className
      )}
    >
      {message}
    </div>
  );
}
