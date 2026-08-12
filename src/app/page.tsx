import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { ArticleCard } from "@/components/home/ArticleCard";
import { getAllPosts, getAllCategories } from "@/lib/posts";
import LoadingPage from "./loading";

// Main server component to fetch and render the page content
async function HomeContent() {
  const [categories, { posts }] = await Promise.all([
    getAllCategories(),
    getAllPosts({ perPage: 6 }), // Fetching top 6 posts for Trending
  ]);

  return (
    <>
      <HeroSection />
      
      <CategoryScroller categories={categories} />

      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Trending Articles</h2>
              <p className="text-muted-foreground mt-2">The latest and greatest from our authors</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-20 text-center">
              <h3 className="text-2xl font-bold text-foreground">No articles published yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Check back soon! Our authors are working on some amazing content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post as any} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<LoadingPage />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
