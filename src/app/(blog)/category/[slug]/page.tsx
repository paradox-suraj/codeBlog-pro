import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getAllPosts, getAllCategories } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} — CodeBlog Pro`,
    description: category.description ?? `Explore posts in ${category.name}.`,
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = Number(searchParams.page ?? "1");
  const { posts, total, totalPages, hasNextPage, hasPreviousPage } = await getAllPosts({
    page,
    categorySlug: params.slug,
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container px-4 py-12 md:px-6 md:py-16 mx-auto">
        {/* Category header */}
        <div className="relative mb-14 overflow-hidden rounded-[40px] bg-secondary p-8 md:p-14 shadow-lg border border-border flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="relative z-10 max-w-2xl flex-1">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: category.color ?? "hsl(var(--primary))" }}
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tight md:text-6xl text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl leading-relaxed text-muted-foreground">{category.description}</p>
            )}
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold bg-background/50 backdrop-blur rounded-full px-4 py-2 text-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {total} published {total === 1 ? "article" : "articles"}
            </p>
          </div>
          
          {/* Dynamic 3D Icon if exists */}
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex-shrink-0 drop-shadow-2xl">
              <Image
                  src={`/assets/categories/${category.slug}.png`}
                  alt={`${category.name} icon`}
                  fill
                  className="object-contain"
              />
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-border bg-card">
            <h3 className="text-2xl font-bold">No posts in this category yet.</h3>
            <p className="mt-2 text-muted-foreground text-lg">Check back later for new content!</p>
            <Button asChild variant="outline" className="mt-6 rounded-full px-8">
              <Link href="/blog">View all posts</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-8 border-t border-border">
                {hasPreviousPage ? (
                  <Button asChild variant="outline" className="rounded-full px-6">
                    <Link href={`/category/${params.slug}?page=${page - 1}`}>Previous</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full px-6 opacity-50" disabled>
                    Previous
                  </Button>
                )}
                <span className="text-sm font-bold text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {hasNextPage ? (
                  <Button asChild variant="outline" className="rounded-full px-6">
                    <Link href={`/category/${params.slug}?page=${page + 1}`}>Next</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full px-6 opacity-50" disabled>
                    Next
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
