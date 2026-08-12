import Link from "next/link";
import { Clock, Eye, Calendar } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostHeaderProps {
  post: {
    title: string;
    excerpt: string | null;
    createdAt: Date;
    readingTime: number | null;
    views: number;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      profile: {
        bio: string | null;
        avatar: string | null;
        twitter: string | null;
        github: string | null;
        website: string | null;
      } | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      icon: string | null;
    } | null;
    tags: Array<{ tag: { id: string; name: string; slug: string; color: string | null } }>;
    _count: { likes: number; comments: number; bookmarks: number };
  };
}

export function PostHeader({ post }: PostHeaderProps) {
  const authorAvatar =
    post.author.profile?.avatar ?? post.author.image ?? null;
  const authorName = post.author.name ?? "Anonymous";
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="mb-10 space-y-8">
      {/* Category + Tags */}
      <div className="flex flex-wrap items-center gap-3">
        {post.category && (
          <Link href={`/category/${post.category.slug}`}>
            <span
              className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: post.category.color ?? "hsl(var(--primary))",
              }}
            >
              {post.category.icon && (
                <span className="mr-1.5">{post.category.icon}</span>
              )}
              {post.category.name}
            </span>
          </Link>
        )}
        {post.tags.map(({ tag }) => (
          <Link key={tag.id} href={`/tag/${tag.slug}`}>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground hover:bg-primary/20 transition-colors">
              #{tag.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground pt-4 border-t border-border">
        {/* Author */}
        <Link
          href={`/authors/${post.author.id}`}
          className="flex items-center gap-3 transition-colors hover:text-foreground mr-2"
        >
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarImage src={authorAvatar ?? undefined} alt={authorName} />
            <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-bold text-base">{authorName}</span>
        </Link>

        <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
          <Calendar className="h-4 w-4 text-primary" />
          <time dateTime={post.createdAt.toString()}>
            {formatDate(post.createdAt)}
          </time>
        </span>

        {post.readingTime && (
          <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
            <Clock className="h-4 w-4 text-primary" />
            {post.readingTime} min read
          </span>
        )}

        <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
          <Eye className="h-4 w-4 text-primary" />
          {formatNumber(post.views)} views
        </span>
      </div>
    </header>
  );
}
