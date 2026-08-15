"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Menu, PenLine } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchDialog } from "@/components/search/SearchDialog";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Blog", href: "/blog" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isAuthorOrAdmin } = useCurrentUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showWriteAction = !isAuthenticated || isAuthorOrAdmin;
  const writeHref = isAuthorOrAdmin ? "/dashboard/posts/new" : "/login";
  const writeLabel = isAuthorOrAdmin ? "Write" : "Start writing";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        isScrolled
          ? "border-border bg-background/82 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/72 backdrop-blur"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-bold tracking-tight"
          aria-label="CodeBlog Pro home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:-rotate-3">
            <Code2 className="h-5 w-5" />
          </span>
          <span className="hidden text-base sm:inline">CodeBlog Pro</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} active={isActive(pathname, link.href)}>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
          {showWriteAction && (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={writeHref}>
                <PenLine className="h-4 w-4" />
                {writeLabel}
              </Link>
            </Button>
          )}
          {isAuthenticated && <NotificationBell />}
          <UserMenu />

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(90vw,360px)]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Code2 className="h-5 w-5 text-primary" />
                  CodeBlog Pro
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 grid gap-2" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-3 text-base font-semibold transition-colors",
                      isActive(pathname, link.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {(showWriteAction || !isAuthenticated) && (
                <div className="mt-6 grid gap-3 border-t pt-6">
                  {showWriteAction && (
                    <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href={writeHref}>
                        <PenLine className="h-4 w-4" />
                        {writeLabel}
                      </Link>
                    </Button>
                  )}
                  {!isAuthenticated && (
                    <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
