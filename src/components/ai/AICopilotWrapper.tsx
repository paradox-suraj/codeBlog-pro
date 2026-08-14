"use client";

import { usePathname } from "next/navigation";
import { AICopilot } from "./AICopilot";

interface AICopilotWrapperProps {
  role?: string;
}

export function AICopilotWrapper({ role }: AICopilotWrapperProps) {
  const pathname = usePathname();

  // Determine if we are on a blog post page
  let postIdContext: string | undefined = undefined;
  
  // Note: We'd normally need the actual database ID of the post, but if we only have the slug from the URL, 
  // we might need the backend to accept a slug instead of an ID.
  // Let's assume the backend takes postId as either an ID or a slug, since slugs are unique.
  // The path is typically /slug for blog posts, but we have other pages like /about, /authors.
  // We can check if it's a known non-post path, or we can just pass the slug and let the backend figure it out.
  // Actually, wait. It's safer if the backend uses slug, since `postId` is what we pass. 
  // We'll pass the path segment.
  
  if (
    pathname && 
    pathname !== "/" && 
    !pathname.startsWith("/admin") && 
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register") &&
    !pathname.startsWith("/about") &&
    !pathname.startsWith("/authors") &&
    !pathname.startsWith("/category") &&
    !pathname.startsWith("/tag") &&
    !pathname.startsWith("/search")
  ) {
    // It's likely a blog post slug. Let's pass it. The backend route can query by slug.
    postIdContext = pathname.substring(1); // remove leading slash
  }

  return <AICopilot postId={postIdContext} role={role} />;
}
