"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations";
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

const ERROR_MESSAGES = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthSignin: "There was a problem signing in with this provider.",
  OAuthCallback: "There was a problem completing the sign-in process.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  Default: "An unexpected error occurred. Please try again.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [isCredentialLoading, setIsCredentialLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    errorParam ? (ERROR_MESSAGES[errorParam as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.Default) : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsCredentialLoading(true);
    setServerError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError(ERROR_MESSAGES.CredentialsSignin);
        setIsCredentialLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError(ERROR_MESSAGES.Default);
      setIsCredentialLoading(false);
    }
  };

  return (
    <Card className="rounded-[32px] border-2 border-border shadow-2xl bg-card overflow-hidden">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Server-level error banner */}
        <FormMessage message={serverError ?? undefined} variant="error" />

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <LoginButton provider="github" callbackUrl={callbackUrl} />
          <LoginButton provider="google" callbackUrl={callbackUrl} />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isCredentialLoading}
              className="rounded-full px-5 py-6 bg-secondary/50 border-border focus:bg-background transition-colors"
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isCredentialLoading}
                className="rounded-full px-5 py-6 bg-secondary/50 border-border focus:bg-background transition-colors pr-12"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isCredentialLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormField>

          <Button
            type="submit"
            className="w-full rounded-full py-6 text-base font-bold shadow-sm"
            disabled={isCredentialLoading}
          >
            {isCredentialLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Sign In with Email
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
