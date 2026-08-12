import Link from "next/link";
import Image from "next/image";
import type { Category } from "@prisma/client";

interface CategoryScrollerProps {
  categories: Category[];
}

export function CategoryScroller({ categories }: CategoryScrollerProps) {
  if (!categories?.length) return null;

  return (
    <div className="w-full py-12 bg-card border-y border-border overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Explore Topics</h2>
          <p className="text-muted-foreground text-sm">Discover what interests you</p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="group relative flex-none w-48 h-48 rounded-3xl bg-secondary flex flex-col items-center justify-center p-6 text-center hover:bg-secondary/80 transition-all snap-start shadow-sm hover:shadow-md border border-border"
            >
              {/* Note: The user needs to place transparent PNGs in public/assets/categories/ */}
              <div className="relative w-24 h-24 mb-4 transition-transform group-hover:-translate-y-2 duration-300">
                <Image
                  src={`/assets/categories/${category.slug}.png`}
                  alt={`${category.name} 3D icon`}
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
              <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
