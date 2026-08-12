"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FolderOpen, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  className?: string;
  compact?: boolean;
}

const QUICK_LINKS = [
  { href: "/blog", label: "Browse articles", icon: BookOpen },
  { href: "/categories", label: "Explore categories", icon: FolderOpen },
  { href: "/authors", label: "Find authors", icon: Users },
];

export function SearchDialog({ className, compact = false }: SearchDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : "sm"}
          className={cn(
            !compact &&
              "h-10 w-10 px-0 text-muted-foreground lg:w-auto lg:min-w-[180px] lg:justify-between lg:px-3",
            className
          )}
          aria-label="Search articles"
        >
          <span className={cn("items-center gap-2", compact ? "sr-only" : "hidden lg:flex")}>
            <Search className="h-4 w-4" />
            Search
          </span>
          <Search className={cn("h-4 w-4", !compact && "lg:hidden")} />
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Search CodeBlog Pro</DialogTitle>
          <DialogDescription>
            Search article titles, excerpts, and content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitSearch} className="border-y p-4">
          <label htmlFor="site-search" className="sr-only">
            Search articles
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Search TypeScript, databases, architecture..."
              className="h-12 pl-9 pr-24 text-base"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2"
              disabled={!query.trim()}
            >
              Search
            </Button>
          </div>
        </form>

        <div className="p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
            Quick links
          </p>
          <div className="grid gap-1">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:bg-accent"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
