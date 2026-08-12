import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

interface CategoryBarProps {
  categories: Category[];
  activeSlug?: string;
  allHref?: string;
  allLabel?: string;
  getCategoryHref?: (slug: string) => string;
  className?: string;
}

export function CategoryBar({
  categories,
  activeSlug,
  allHref = "/blog",
  allLabel = "All posts",
  getCategoryHref = (slug) => `/category/${slug}`,
  className,
}: CategoryBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-card/88 shadow-sm">
        <div className="flex w-max gap-1 p-1">
          <CategoryPill href={allHref} active={!activeSlug} label={allLabel} />
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              href={getCategoryHref(category.slug)}
              active={activeSlug === category.slug}
              label={category.name}
              count={category._count?.posts}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>
    </div>
  );
}

function CategoryPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px]",
            active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
