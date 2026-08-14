import { Suspense } from "react";
import type { Metadata } from "next";
import { searchPosts } from "@/lib/posts";
import { PostCard, PostCardSkeleton } from "@/components/blog/PostCard";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
  };
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams.q;
  return {
    title: q ? `Search: "${q}" — CodeBlog Pro` : "Search — CodeBlog Pro",
    description: q ? `Search results for "${q}".` : "Search articles on CodeBlog Pro.",
  };
}

async function SearchResults({ query, page, sort }: { query: string; page: number; sort: string }) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">Start typing to search</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Search across titles, excerpts, and content.
        </p>
      </div>
    );
  }

  const { posts, total, totalPages, hasNextPage, hasPreviousPage } =
    await searchPosts(query, page, sort);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No results for &ldquo;{query}&rdquo;</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try different keywords or browse by category.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/blog">Browse all posts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {hasPreviousPage ? (
            <Button asChild variant="outline">
              <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}&sort=${sort}`}>
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {hasNextPage ? (
            <Button asChild variant="outline">
              <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}&sort=${sort}`}>
                Next
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function SearchPage({ searchParams }: Props) {
  const query = (searchParams.q ?? "").trim();
  const page = Number(searchParams.page ?? "1");
  const sort = searchParams.sort ?? "latest";

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Search</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          Find articles in the archive
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Search across published titles, excerpts, and article content.
        </p>

        {/* Search form */}
        <form
          method="GET"
          action="/search"
          className="mt-6 flex max-w-2xl flex-col gap-2 rounded-lg border bg-card/88 p-3 shadow-sm sm:flex-row"
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search posts..."
              className="pl-9"
              autoFocus
            />
          </div>
          <select 
            name="sort" 
            defaultValue={sort}
            className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Suspense key={`${query}-${page}-${sort}`} fallback={query ? <SearchResultsSkeleton /> : null}>
        <SearchResults query={query} page={page} sort={sort} />
      </Suspense>
    </div>
  );
}
