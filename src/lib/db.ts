import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Prisma Client Singleton
//
// In development, Next.js hot-reload creates new module instances on each
// file save, which would exhaust the database connection pool. We store a
// single PrismaClient instance on the Node.js global object so it survives
// hot-reloads.
//
// In production, each serverless invocation gets its own isolated module
// scope, so this guard has no effect — each cold start creates exactly one
// client, which is the correct behaviour.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  // Allow the global var declaration to persist across hot-reloads in dev
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const db: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}

export { db };
