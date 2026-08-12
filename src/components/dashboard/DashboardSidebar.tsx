"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Posts", href: "/dashboard/posts", icon: FileText },
  { label: "New Post", href: "/dashboard/posts/new", icon: PlusCircle },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r-2 border-border bg-card shadow-sm z-10">
      {/* Brand */}
      <div className="flex items-center gap-4 border-b-2 border-border px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <span className="text-lg font-black text-primary-foreground">C</span>
        </div>
        <div>
          <p className="text-sm font-bold">CodeBlog Pro</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase()} Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-full px-4 py-3 text-sm font-bold transition-colors mb-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t-2 border-border px-4 py-4 bg-secondary/50">
        <div className="flex items-center gap-3 rounded-2xl bg-card border-2 border-border p-3 shadow-sm">
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
