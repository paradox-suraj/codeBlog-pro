import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "My Comments - CodeBlog Pro",
};

export default async function CommentsPage() {
  const user = await requireAuth();

  const comments = await db.comment.findMany({
    where: { authorId: user.id },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Comments</h1>
        <p className="text-muted-foreground mt-2">Discussions you have participated in.</p>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl border-2 border-border border-dashed p-12 text-center">
            <h3 className="text-lg font-bold">No comments yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Join the conversation by leaving a comment on an article.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Commented on </span>
                  <Link href={`/${comment.post.slug}#comments`} className="font-bold hover:text-primary transition-colors hover:underline">
                    {comment.post.title}
                  </Link>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-border">
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
