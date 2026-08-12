import { requireAdmin } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden border-t">
      <div className="hidden md:flex">
        <AdminSidebar user={user} />
      </div>
      <main className="flex-1 overflow-y-auto bg-background">
        <nav className="flex gap-2 overflow-x-auto border-b-2 border-border bg-card px-4 py-4 md:hidden">
          {[
            { label: "Overview", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Posts", href: "/admin/posts" },
            { label: "Newsletter", href: "/admin/newsletter" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-muted-foreground hover:bg-destructive/20 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="container max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
