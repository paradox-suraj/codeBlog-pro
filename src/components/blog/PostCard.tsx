import Image from "next/image";
import Link from "next/link";
import { Clock3, Eye, Heart, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    readingTime: number | null;
    views: number;
    author: {
      id?: string;
      name: string | null;
      image: string | null;
      profile?: { avatar: string | null } | null;
    };
    category: {
      name: string;
      slug?: string;
      color: string | null;
    } | null;
    _count: {
      likes: number;
      comments: number;
      bookmarks?: number;
    };
  };
  variant?: "standard" | "featured" | "compact" | "horizontal" | "bookmarked";
  className?: string;
}

export function PostCard({ post, variant = "standard", className }: PostCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isHorizontal = variant === "horizontal" || variant === "bookmarked";
  const authorName = post.author.name ?? "CodeBlog Pro";
  const authorAvatar = post.author.profile?.avatar ?? post.author.image ?? undefined;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card shadow-lg hover:shadow-soft transition-all duration-300 border border-border",
        isHorizontal && "grid gap-0 sm:grid-cols-[220px_1fr]",
        isFeatured && "grid gap-0 lg:grid-cols-[1.12fr_0.88fr]",
        isCompact && "p-4",
        className
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-3xl"
      >
        <span className="sr-only">Read {post.title}</span>
      </Link>

      {!isCompact && (
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            isHorizontal ? "aspect-[16/10] sm:aspect-auto" : "aspect-[16/10]",
            isFeatured && "min-h-[260px] lg:min-h-[430px]"
          )}
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={
                isFeatured
                  ? "(max-width: 1024px) 100vw, 56vw"
                  : isHorizontal
                    ? "(max-width: 640px) 100vw, 220px"
                    : "(max-width: 768px) 100vw, 33vw"
              }
            />
          ) : (
            <FallbackCover title={post.title} category={post.category?.name} />
          )}

          {post.category && (
            <div className="absolute left-4 top-4 z-10">
              <CategoryBadge category={post.category} />
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-6",
          isFeatured && "justify-end p-8 lg:p-10",
          isCompact && "p-0"
        )}
      >
        {isCompact && post.category && (
          <CategoryBadge category={post.category} className="mb-3 w-fit" />
        )}

        <div className="flex-1">
          <h2
            className={cn(
              "font-bold leading-tight text-foreground transition-colors group-hover:text-primary",
              isFeatured ? "text-3xl md:text-4xl" : "text-xl",
              isCompact && "text-base",
              isHorizontal && "text-lg line-clamp-2"
            )}
          >
            {post.title}
          </h2>

          {post.excerpt && !isCompact && (
            <p
              className={cn(
                "mt-3 line-clamp-3 text-sm text-muted-foreground",
                isFeatured && "text-base",
                isHorizontal && "line-clamp-2"
              )}
            >
              {post.excerpt}
            </p>
          )}
        </div>

        <div
          className={cn(
            "mt-6 flex items-center justify-between gap-4",
            isCompact && "mt-4"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src={authorAvatar} alt="" />
              <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{authorName}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <time dateTime={post.createdAt.toISOString()}>
                  {formatDate(post.createdAt, { pattern: "MMM d, yyyy" })}
                </time>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {post.readingTime ?? 5} min
                </span>
              </p>
            </div>
          </div>

          {!isCompact && (
            <div className="hidden shrink-0 items-center gap-3 text-xs font-medium text-muted-foreground sm:flex">
              <Metric icon={Eye} label={`${formatNumber(post.views)} views`} />
              <Metric icon={Heart} label={`${formatNumber(post._count.likes)}`} />
              <Metric icon={MessageSquare} label={`${formatNumber(post._count.comments)}`} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CategoryBadge({
  category,
  className,
}: {
  category: NonNullable<PostCardProps["post"]["category"]>;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground shadow-sm", className)}
      style={category.color ? { color: category.color } : undefined}
    >
      {category.name}
    </div>
  );
}

function FallbackCover({ title, category }: { title: string; category?: string }) {
  return (
    <div className="absolute inset-0 bg-muted flex items-center justify-center">
      <span className="text-muted-foreground font-medium">No Image</span>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-full" title={label}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-4/5 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
        <div className="mt-4 flex gap-3">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
                <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded-full bg-muted animate-pulse" />
            </div>
        </div>
      </div>
    </div>
  );
}
