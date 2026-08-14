import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "My Bookmarks - CodeBlog Pro",
};

export default async function BookmarksPage() {
  const user = await requireAuth();

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
          excerpt: true,
          createdAt: true,
          author: { select: { name: true } },
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground mt-2">Articles you have saved for reading later.</p>
      </div>

      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border-2 border-border border-dashed p-12 text-center">
            <h3 className="text-lg font-bold">No bookmarks yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              When you see an interesting article, hit the bookmark icon to save it here.
            </p>
            <Link href="/" className="text-primary font-bold hover:underline">
              Browse articles
            </Link>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group relative rounded-2xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:border-primary">
              <div className="flex flex-col gap-2">
                <Link href={`/${bookmark.post.slug}`} className="text-xl font-bold group-hover:text-primary transition-colors">
                  {bookmark.post.title}
                </Link>
                {bookmark.post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{bookmark.post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span>By {bookmark.post.author.name}</span>
                  <span>•</span>
                  <span>Saved on {format(new Date(bookmark.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
