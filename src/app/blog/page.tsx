import { PostCard } from "@/components/blog/PostCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { CategoryBar } from "@/components/home/CategoryBar";
import { getAllPosts, getAllCategories } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PostStatus } from "@prisma/client";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; q?: string; category?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort || "latest"; // 'latest' | 'popular'
  const categorySlug = searchParams.category;
  const query = searchParams.q?.trim() ?? "";

  const makeHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categorySlug) params.set("category", categorySlug);
    if (sort !== "latest") params.set("sort", sort);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === "" || value === "latest") params.delete(key);
      else params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  let followingIds: string[] = [];
  const session = await auth();

  if (sort === "foryou" && session?.user?.id) {
    const follows = await db.follows.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    followingIds = follows.map(f => f.followingId);
    
    // If they aren't following anyone, we might just return empty or fallback.
    // We'll pass the array; if empty, prisma `in: []` returns no posts.
  }

  const [categories, { posts, hasNextPage, hasPreviousPage, totalPages, total }] = await Promise.all([
    getAllCategories(),
    getAllPosts({
      page,
      perPage: 10,
      categorySlug,
      query,
      orderBy: sort === "popular" ? "views" : "createdAt",
      order: "desc",
      status: "PUBLISHED" as PostStatus,
      authorIds: sort === "foryou" ? followingIds : undefined,
    }),
  ]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Header Section */}
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Archive</p>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
                Articles for builders
              </h1>
              <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
                Explore {total} published {total === 1 ? "article" : "articles"} across practical engineering, product architecture, and developer workflows.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl">
              <form action="/blog" className="relative flex items-center w-full">
                <label htmlFor="blog-search" className="sr-only">Search articles</label>
                <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                <input
                  id="blog-search"
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search titles, excerpts, and content..."
                  className="w-full rounded-full border-2 border-border bg-card py-4 pl-14 pr-32 text-base outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-sm"
                />
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Category Filter */}
            <div className="pt-2">
              <CategoryBar
                categories={categories}
                activeSlug={categorySlug}
                allHref={makeHref({ category: undefined, page: undefined })}
                getCategoryHref={(slug) => makeHref({ category: slug, page: undefined })}
              />
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex flex-col gap-4 border-y border-border py-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Showing {posts.length} of {total} posts
              </span>
              <div className="flex gap-3">
                {session && (
                  <Button asChild variant={sort === "foryou" ? "default" : "outline"} className="rounded-full">
                    <Link href={makeHref({ sort: "foryou", page: undefined })}>For You</Link>
                  </Button>
                )}
                <Button asChild variant={sort === "latest" ? "default" : "outline"} className="rounded-full">
                  <Link href={makeHref({ sort: "latest", page: undefined })}>Latest</Link>
                </Button>
                <Button asChild variant={sort === "popular" ? "default" : "outline"} className="rounded-full">
                  <Link href={makeHref({ sort: "popular", page: undefined })}>Popular</Link>
                </Button>
              </div>
            </div>

            {/* Post Grid */}
            {posts.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-20 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">
                  {sort === "foryou" && followingIds.length === 0 ? "You aren't following anyone yet" : "No matching articles"}
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
                  {sort === "foryou" && followingIds.length === 0 
                    ? "Discover great authors on the Latest or Popular feeds, and follow them to see their posts here."
                    : "Try a different search term or clear the current filters."}
                </p>
                {sort !== "foryou" && (
                  <Button asChild variant="outline" className="mt-6 rounded-full px-8">
                    <Link href="/blog">Clear filters</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post as any} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-8">
                {hasPreviousPage ? (
                  <Button variant="outline" className="rounded-full px-6" asChild>
                    <Link href={makeHref({ page: page - 1 })}>Previous</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full px-6 opacity-50" disabled>Previous</Button>
                )}
                <span className="text-sm font-bold text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {hasNextPage ? (
                  <Button variant="outline" className="rounded-full px-6" asChild>
                    <Link href={makeHref({ page: page + 1 })}>Next</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full px-6 opacity-50" disabled>Next</Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-[350px] shrink-0">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
