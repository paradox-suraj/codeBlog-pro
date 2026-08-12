import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug);
  if (!tag) return { title: "Tag Not Found" };
  return {
    title: `#${tag.name} — CodeBlog Pro`,
    description: `Posts tagged with #${tag.name}.`,
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export const revalidate = 60;

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await getTagBySlug(params.slug);
  if (!tag) notFound();

  const page = Number(searchParams.page ?? "1");
  const { posts, total, totalPages, hasNextPage, hasPreviousPage } = await getAllPosts({
    page,
    tagSlug: params.slug,
  });

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10 rounded-lg border bg-card/88 p-6 shadow-soft md:p-8">
        <Badge
          className="mb-4 text-base"
          style={tag.color ? { backgroundColor: tag.color, color: "white" } : {}}
        >
          #{tag.name}
        </Badge>
        <h1 className="mb-3 text-4xl font-black tracking-tight md:text-5xl">
          #{tag.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {total} published {total === 1 ? "article" : "articles"} tagged with #{tag.name}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No posts with this tag yet.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/blog">View all posts</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              {hasPreviousPage ? (
                <Button asChild variant="outline">
                  <Link href={`/tag/${params.slug}?page=${page - 1}`}>Previous</Link>
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
                  <Link href={`/tag/${params.slug}?page=${page + 1}`}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Next
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
