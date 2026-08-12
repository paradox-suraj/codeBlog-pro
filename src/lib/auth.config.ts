import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Notice this is only an object, not a full Auth.js instance
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // Configured in auth.ts
  callbacks: {
    /**
     * session() shapes the object returned by useSession() and auth().
     * We expose only the fields that components and server actions need.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
      }
      return session;
    },
    /**
     * jwt() is called every time a JWT is created or updated.
     * Base logic (mapping from user to token) happens here so it's
     * available to the Edge middleware.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user.name ?? user.email?.split("@")[0]) ?? "";
      }

      // Handle manual session updates (e.g., admin panel role change)
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role as Role;
        if (session.username) token.username = session.username as string;
      }

      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
