import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "Reading History - CodeBlog Pro",
};

export default async function ReadingHistoryPage() {
  const user = await requireAuth();

  const history = await db.readingProgress.findMany({
    where: { userId: user.id, progress: { gt: 0 } },
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
    orderBy: { lastRead: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Reading History</h1>
        <p className="text-muted-foreground mt-2">Pick up right where you left off.</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="rounded-2xl border-2 border-border border-dashed p-12 text-center">
            <h3 className="text-lg font-bold">No reading history yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Start reading an article and we&apos;ll save your progress here.
            </p>
            <Link href="/" className="text-primary font-bold hover:underline">
              Browse articles
            </Link>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="group relative rounded-2xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:border-primary overflow-hidden">
              <div className="flex flex-col gap-2">
                <Link href={`/${record.post.slug}`} className="text-xl font-bold group-hover:text-primary transition-colors">
                  {record.post.title}
                </Link>
                {record.post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{record.post.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <div className="flex items-center gap-4">
                    <span>By {record.post.author.name}</span>
                    <span>•</span>
                    <span>Last read {format(new Date(record.lastRead), "MMM d, yyyy")}</span>
                  </div>
                  <span className="font-bold text-primary">{record.progress}%</span>
                </div>
              </div>
              
              {/* Progress Bar Indicator */}
              <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full" aria-hidden="true">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${record.progress}%` }} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
