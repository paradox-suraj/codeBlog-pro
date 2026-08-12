import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import crypto from "crypto";
import {
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  getCommentsByPost,
  incrementViewCount,
  getUserPostInteractions,
} from "@/lib/posts";
import { extractHeadings } from "@/lib/mdx";
import { auth } from "@/lib/auth";
import { PostHeader } from "@/components/blog/PostHeader";
import { MDXContent } from "@/components/blog/MDXContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CommentSection } from "@/components/blog/CommentSection";
import { LikeButton } from "@/components/blog/LikeButton";
import { BookmarkButton } from "@/components/blog/BookmarkButton";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PostCard } from "@/components/blog/PostCard";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: { slug: string };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ogUrl = `${siteUrl}/${post.slug}`;
  const authorName = post.author.name ?? "CodeBlog Pro";

  return {
    title: `${post.title} | CodeBlog Pro`,
    description: post.excerpt ?? post.title,
    authors: [{ name: authorName }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      url: ogUrl,
      siteName: "CodeBlog Pro",
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [authorName],
      tags: post.tags.map(({ tag }) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [`${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`],
    },
    alternates: { canonical: ogUrl },
  };
}

// ── Static Params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const { posts } = await getAllPosts({ perPage: 100 });
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 60;

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  // Hash the IP for anonymous view de-duplication
  const headersList = headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  // Parallel data fetching
  const [, interactions, comments, related] = await Promise.all([
    incrementViewCount(post.id, userId, userId ? undefined : ipHash),
    getUserPostInteractions(post.id, userId),
    getCommentsByPost(post.id),
    getRelatedPosts(
      post.id,
      post.tags.map(({ tag }) => tag.id)
    ),
  ]);

  const headings = extractHeadings(post.content);

  const authorName = post.author.name ?? "Anonymous";
  const authorAvatar = post.author.profile?.avatar ?? post.author.image ?? null;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const articleUrl = `${siteUrl.replace(/\/$/, "")}/${post.slug}`;
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="container py-10 md:py-14">
      <ReadingProgress />
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative mb-14 aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-border bg-muted shadow-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        {/* Post header */}
        <PostHeader post={post} />

        <div className="relative flex gap-12">
          {/* Main article content */}
          <article className="min-w-0 flex-1">
            <MDXContent content={post.content} />

            <Separator className="my-10" />

            {/* Engagement actions row */}
            <div className="flex flex-col gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <LikeButton
                  slug={post.slug}
                  initialCount={post._count.likes}
                  initialLiked={interactions.liked}
                />
                <BookmarkButton
                  slug={post.slug}
                  initialBookmarked={interactions.bookmarked}
                />
                <CopyLinkButton url={articleUrl} />
              </div>
              <span className="text-sm text-muted-foreground">
                {post._count.comments}{" "}
                {post._count.comments === 1 ? "comment" : "comments"}
              </span>
            </div>

            <Separator className="my-10" />

            {/* Author card */}
            <div className="rounded-3xl border-2 border-border bg-card p-8 shadow-sm mt-8">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={authorAvatar ?? undefined}
                    alt={authorName}
                  />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    href={`/authors/${post.author.id}`}
                    className="text-lg font-bold hover:text-primary"
                  >
                    {authorName}
                  </Link>
                  {post.author.profile?.bio && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.author.profile.bio}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    {post.author.profile?.twitter && (
                      <a
                        href={`https://twitter.com/${post.author.profile.twitter.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        @{post.author.profile.twitter}
                      </a>
                    )}
                    {post.author.profile?.github && (
                      <a
                        href={`https://github.com/${post.author.profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        GitHub
                      </a>
                    )}
                    {post.author.profile?.website && (
                      <a
                        href={post.author.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            {/* Comments */}
            <CommentSection slug={post.slug} initialComments={comments} />
          </article>

          {/* Desktop sticky TOC sidebar */}
          {headings.length > 0 && (
            <aside className="hidden w-56 shrink-0 xl:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">
              Related articles
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((relPost) => (
                <PostCard key={relPost.id} post={relPost} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
