import { PostCard, type PostCardProps } from "@/components/blog/PostCard";

interface FeaturedPostsProps {
  posts: PostCardProps["post"][];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card/70 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Featured reading is coming soon</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Published posts marked as featured will appear here. Until then, browse the latest articles below.
        </p>
      </section>
    );
  }

  const [primaryFeature, ...secondaryFeatures] = posts;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Editor&apos;s picks</p>
          <h2 className="text-3xl font-bold tracking-tight">Featured Reading</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Deep dives, tutorials, and engineering stories worth opening first.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {primaryFeature && (
          <div className="lg:col-span-2">
            <PostCard post={primaryFeature} variant="featured" />
          </div>
        )}

        <div className="grid gap-5">
          {secondaryFeatures.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
