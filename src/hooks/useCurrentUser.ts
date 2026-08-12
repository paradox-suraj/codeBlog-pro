"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

interface CurrentUser {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  role: Role;
  username: string;
}

interface UseCurrentUserReturn {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
  isAuthorOrAdmin: boolean;
  update: (data?: Record<string, unknown>) => Promise<void>;
}

/**
 * Client-side hook to access the current authenticated user with
 * typed role information. Wraps useSession() from next-auth/react.
 *
 * @example
 * const { user, isAdmin, isLoading } = useCurrentUser();
 * if (isLoading) return <Spinner />;
 * if (!user) return <LoginPrompt />;
 * if (isAdmin) return <AdminBadge />;
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const { data: session, status, update } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user: CurrentUser | null = isAuthenticated
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        username: session.user.username,
      }
    : null;

  const updateSession = async (data?: Record<string, unknown>) => {
    await update(data);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "ADMIN",
    isAuthor: user?.role === "AUTHOR",
    isAuthorOrAdmin: user?.role === "AUTHOR" || user?.role === "ADMIN",
    update: updateSession,
  };
}
