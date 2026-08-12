"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Shield,
  PenSquare,
  LogOut,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Generates initials from a user's name for the avatar fallback.
 * @example getInitials("John Doe") => "JD"
 */
function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Authenticated user avatar with dropdown menu.
 * Shows dashboard links based on the user's role.
 * Displays a Sign In button when the user is not authenticated.
 */
export function UserMenu() {
  const { user, isLoading, isAuthenticated, isAdmin, isAuthorOrAdmin } =
    useCurrentUser();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "User avatar"}
            />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* User info header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name ?? user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation links */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          {/* Author-only links */}
          {isAuthorOrAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/posts" className="cursor-pointer">
                  <PenSquare className="mr-2 h-4 w-4" />
                  My Posts
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Admin-only link */}
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            signOut({ callbackUrl: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
