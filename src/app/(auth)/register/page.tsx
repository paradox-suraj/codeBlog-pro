"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, FormMessage } from "@/components/ui/form";
import { LoginButton } from "@/components/auth/LoginButton";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);
    setFieldErrors({});

    try {
      // ── Step 1: Create the account ──────────────────────────────────
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setServerError(result.error ?? "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // ── Step 2: Auto-login after successful registration ────────────
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account was created, but auto-login failed. Redirect to login.
        router.push("/login?registered=true");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  /**
   * Merges client-side (react-hook-form) errors with server-side field errors.
   * Server errors take priority since they reflect actual DB state.
   */
  const getFieldError = (field: keyof RegisterInput): string | undefined => {
    return fieldErrors[field]?.[0] ?? errors[field]?.message;
  };

  return (
    <Card className="rounded-[32px] border-2 border-border shadow-2xl bg-card overflow-hidden">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Get started with your free CodeBlog Pro account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Server-level error banner */}
        <FormMessage message={serverError ?? undefined} variant="error" />

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <LoginButton provider="github" />
          <LoginButton provider="google" />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Full Name"
            htmlFor="name"
            error={getFieldError("name")}
          >
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isLoading}
              className="rounded-full px-5 py-6 bg-secondary/50 border-border focus:bg-background transition-colors"
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={getFieldError("email")}
          >
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              className="rounded-full px-5 py-6 bg-secondary/50 border-border focus:bg-background transition-colors"
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={getFieldError("password")}
          >
            <PasswordInput
              id="password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              disabled={isLoading}
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={getFieldError("confirmPassword")}
          >
            <PasswordInput
              id="confirmPassword"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              disabled={isLoading}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>

          <Button type="submit" className="w-full rounded-full py-6 text-base font-bold shadow-sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Create Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    showPassword: boolean;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  }
>(({ showPassword, setShowPassword, disabled, ...props }, ref) => (
  <div className="relative">
    <Input
      ref={ref}
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      disabled={disabled}
      className="rounded-full px-5 py-6 bg-secondary/50 border-border focus:bg-background transition-colors pr-12"
      {...props}
    />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      disabled={disabled}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  </div>
));
PasswordInput.displayName = "PasswordInput";
