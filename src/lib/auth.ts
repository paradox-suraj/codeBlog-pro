import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "./auth.config";
import type { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),

  // ── Providers ─────────────────────────────────────────────────────────
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    }),
    MicrosoftEntraId({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0` : undefined,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            accounts: {
              where: { provider: "credentials" },
              select: { access_token: true },
            },
          },
        });

        if (!user) return null;

        // access_token stores the bcrypt hash for credential-based accounts
        const hashedPassword = user.accounts[0]?.access_token;
        if (!hashedPassword) return null;

        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // ── Callbacks ─────────────────────────────────────────────────────────
  callbacks: {
    ...authConfig.callbacks,
    
    /**
     * signIn() runs after successful authentication but before the session
     * is created. Returning false blocks sign-in entirely.
     */
    async signIn({ user, account }) {
      return true;
    },

    /**
     * jwt() is wrapped to add DB-dependent logic (admin auto-promotion)
     */
    async jwt({ token, user, trigger, session }) {
      // First, get the base token from our Edge-safe config
      let newToken = token;
      if (authConfig.callbacks?.jwt) {
        // @ts-ignore
        newToken = await authConfig.callbacks.jwt({ token, user, trigger, session });
      }

      if (user) {
        // Auto-promote the admin email defined in env OR if they are the very first user
        const isFirstUser = await db.user.count() === 1;
        if (
          (user.email === process.env.ADMIN_EMAIL || isFirstUser) &&
          newToken.role !== "ADMIN"
        ) {
          await db.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          newToken.role = "ADMIN";
        }
      }

      return newToken;
    },
  },

  // ── Events ────────────────────────────────────────────────────────────
  events: {
    async createUser({ user }) {
      await db.profile.upsert({
        where: { userId: user.id! },
        update: {},
        create: { userId: user.id! },
      });
    },
  },

  debug: process.env.NODE_ENV === "development",
});
