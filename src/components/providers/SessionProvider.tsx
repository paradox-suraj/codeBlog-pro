"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Wraps NextAuth's SessionProvider.
 * Accepts an optional server-fetched session to avoid a redundant
 * client-side fetch on initial render.
 */
export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
