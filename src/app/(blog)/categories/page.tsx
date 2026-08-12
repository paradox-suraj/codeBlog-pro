import { getAllCategories } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Categories — CodeBlog Pro",
  description: "Explore CodeBlog Pro articles by topic.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  
  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Topics</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          Explore by category
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Find writing by the engineering problems, tools, and practices you care about.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card/70 px-6 py-14 text-center">
          <h2 className="text-xl font-bold">No categories yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Categories will appear after they are created in the publishing workflow.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group rounded-lg border bg-card/88 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border bg-background/70 text-lg">
                    {category.icon || category.name.slice(0, 1)}
                  </div>
                  <h2 className="text-xl font-bold group-hover:text-primary">
                    {category.name}
                  </h2>
                </div>
                <Badge variant="secondary">
                  {category._count.posts} {category._count.posts === 1 ? "post" : "posts"}
                </Badge>
              </div>
              {category.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
