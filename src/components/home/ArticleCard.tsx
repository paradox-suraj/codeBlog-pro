import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

interface ArticleCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    readingTime: number | null;
    category?: { name: string; slug: string } | null;
  };
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card shadow-lg hover:shadow-soft transition-all duration-300 border border-border">
      <div className="flex flex-col flex-1">
        <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground font-medium">No Image</span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-4 left-4 z-10 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
              {post.category.name}
            </div>
          )}
        </Link>
        
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime || 5} min read</span>
          </div>
          
          <Link href={`/blog/${post.slug}`} className="group-hover:text-primary transition-colors">
            <h3 className="font-bold text-xl leading-tight mb-2 line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
            {post.excerpt}
          </p>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors mt-auto w-fit"
          >
            Read Article
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
