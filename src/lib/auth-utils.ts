import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

/**
 * Returns the current authenticated user from the server session.
 * Must only be called in Server Components, Server Actions, or Route Handlers.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Checks if the current user has the ADMIN role.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

/**
 * Checks if the current user has the AUTHOR role.
 * Note: Admins are NOT considered authors by this check.
 * Use isAuthorOrAdmin() for permission checks.
 */
export async function isAuthor(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "AUTHOR";
}

/**
 * Checks if the current user is either an AUTHOR or an ADMIN.
 */
export async function isAuthorOrAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "AUTHOR" || user?.role === "ADMIN";
}

/**
 * Requires the user to be authenticated.
 * Redirects to /login if not authenticated.
 * Returns the authenticated user object.
 *
 * @throws Redirects to /login via Next.js redirect()
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Requires the user to have the ADMIN role.
 * Redirects to /unauthorized if not an admin.
 * Redirects to /login if not authenticated.
 * Returns the authenticated admin user object.
 *
 * @throws Redirects via Next.js redirect()
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Requires the user to have the AUTHOR or ADMIN role.
 * Redirects to /unauthorized if the user is a READER.
 * Redirects to /login if not authenticated.
 * Returns the authenticated author/admin user object.
 *
 * @throws Redirects via Next.js redirect()
 */
export async function requireAuthor() {
  const user = await requireAuth();
  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Checks if the current user has a specific role.
 * Generic helper for custom role checks.
 */
export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * API Route Helper: Requires the user to be authenticated.
 * Returns the user object, or null if unauthorized.
 * Callers should check for null and return a 401 NextResponse.
 */
export async function requireAuthAPI() {
  const user = await getCurrentUser();
  return user ?? null;
}

/**
 * API Route Helper: Requires the user to have the AUTHOR or ADMIN role.
 * Returns the user object, or null if unauthorized.
 * Callers should check for null and return a 403 NextResponse.
 */
export async function requireAuthorAPI() {
  const user = await requireAuthAPI();
  if (!user || (user.role !== "AUTHOR" && user.role !== "ADMIN")) {
    return null;
  }
  return user;
}

/**
 * API Route Helper: Requires the user to have the ADMIN role.
 * Returns the user object, or null if unauthorized.
 * Callers should check for null and return a 403 NextResponse.
 */
export async function requireAdminAPI() {
  const user = await requireAuthAPI();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
