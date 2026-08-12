import Link from "next/link";
import { Search } from "lucide-react";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export async function Sidebar() {
  const [categories, tags, latest] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllPosts({ perPage: 4 }),
  ]);

  const popularCategories = categories
    .filter((category) => category._count.posts > 0)
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, 6);

  const popularTags = tags
    .filter((tag) => tag._count.posts > 0)
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, 12);

  return (
    <aside className="space-y-7">
      <form action="/search" className="rounded-lg border bg-card/88 p-3 shadow-sm">
        <label htmlFor="sidebar-search" className="sr-only">
          Search articles
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="sidebar-search"
            name="q"
            type="search"
            placeholder="Search articles..."
            className="pl-9"
          />
        </div>
      </form>

      <section className="rounded-lg border bg-card/88 p-5 shadow-sm">
        <h2 className="font-bold">Editorial digest</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          New articles and platform notes, sent occasionally.
        </p>
        <NewsletterForm className="mt-4" compact />
      </section>

      {popularCategories.length > 0 && (
        <section className="rounded-lg border bg-card/88 p-5 shadow-sm">
          <h2 className="font-bold">Popular categories</h2>
          <div className="mt-4 grid gap-2">
            {popularCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span>{category.name}</span>
                <Badge variant="secondary">{category._count.posts}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {latest.posts.length > 0 && (
        <section className="rounded-lg border bg-card/88 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-bold">Latest posts</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/blog">All</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4">
            {latest.posts.map((post) => (
              <Link key={post.id} href={`/${post.slug}`} className="group block">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(post.createdAt, { pattern: "MMM d, yyyy" })}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {popularTags.length > 0 && (
        <section className="rounded-lg border bg-card/88 p-5 shadow-sm">
          <h2 className="font-bold">Tags</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                <Badge variant="outline" className="hover:border-primary/40 hover:text-primary">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
