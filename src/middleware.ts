import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Routes that require a valid authenticated session to access. */
const AUTH_REQUIRED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/user",
] as const;

/** Routes exclusive to ADMINs. Anyone else gets redirected to /unauthorized. */
const ADMIN_ONLY_PREFIXES = [
  "/admin",
] as const;

/** Routes that should redirect to /user or /dashboard if the user is already signed in. */
const AUTH_ROUTES = ["/login", "/register"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// Runs on the Vercel Edge Network — must not import Node.js-specific APIs.
// ─────────────────────────────────────────────────────────────────────────────

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role;

  // ─ Guard: Already logged-in users visiting auth pages ─
  // Redirect them to their appropriate dashboard
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const dashboardUrl = new URL(
        userRole === "ADMIN" ? "/admin" : (userRole === "AUTHOR" ? "/dashboard" : "/user"),
        req.nextUrl.origin
      );
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // ─ Guard: Protected routes requiring authentication ─
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    // Preserve the original destination so we can redirect back post-login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─ Guard: Admin-only routes ─
  const requiresAdmin = ADMIN_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (requiresAdmin && userRole !== "ADMIN") {
    const unauthorizedUrl = new URL("/unauthorized", req.nextUrl.origin);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // ─ Guard: Author-only routes (Dashboard) ─
  if (
    pathname.startsWith("/dashboard") &&
    userRole !== "AUTHOR" &&
    userRole !== "ADMIN"
  ) {
    const unauthorizedUrl = new URL("/unauthorized", req.nextUrl.origin);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
});

// ─────────────────────────────────────────────────────────────────────────────
// MATCHER CONFIGURATION
//
// Explicitly include only paths that need middleware processing.
// This prevents the middleware from running on static assets,
// Next.js internals, and API routes (which handle their own auth).
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (Next.js static files)
     * - _next/image   (Next.js image optimizer)
     * - favicon.ico   (browser standard)
     * - public folder assets
     * - API routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
