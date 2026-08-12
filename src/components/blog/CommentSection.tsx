"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Reply, Trash2, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
  profile: { avatar: string | null } | null;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor;
  replies?: Comment[];
}

const commentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters.").max(2000),
});
type CommentForm = z.infer<typeof commentSchema>;

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT FORM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CommentForm({
  slug,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Share your thoughts...",
}: {
  slug: string;
  parentId?: string;
  onSuccess: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentForm) => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, parentId }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error);
      }

      const { comment } = await res.json() as { comment: Comment };
      reset();
      onSuccess(comment);
      toast.success("Comment posted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post comment.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Textarea
        placeholder={placeholder}
        rows={3}
        disabled={isSubmitting}
        {...register("content")}
      />
      {errors.content && (
        <p className="text-xs text-destructive">{errors.content.message}</p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Send className="mr-2 h-3 w-3" />
          )}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE COMMENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  slug,
  currentUserId,
  isAdmin,
  onDelete,
  onReply,
}: {
  comment: Comment;
  slug: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete: (id: string, parentId: string | null) => void;
  onReply: (parentId: string, newComment: Comment) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = isAdmin || comment.author.id === currentUserId;
  const authorName = comment.author.name ?? "Anonymous";
  const authorAvatar = comment.author.profile?.avatar ?? comment.author.image ?? null;

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id }),
      });
      if (!res.ok) throw new Error();
      onDelete(comment.id, comment.parentId);
      toast.success("Comment deleted.");
    } catch {
      toast.error("Failed to delete comment.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        <AvatarImage src={authorAvatar ?? undefined} alt={authorName} />
        <AvatarFallback className="text-xs">{getInitials(authorName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {currentUserId && !comment.parentId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setShowReplyForm((p) => !p)}
            >
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3" />}
              Delete
            </Button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <CommentForm
            slug={slug}
            parentId={comment.id}
            placeholder={`Replying to ${authorName}...`}
            onSuccess={(newComment) => {
              onReply(comment.id, newComment);
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 pl-2 border-l-2 border-muted">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                slug={slug}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMMENT SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface CommentSectionProps {
  slug: string;
  initialComments: Comment[];
}

/**
 * Full comment section with list, add comment form, nested replies, and delete.
 * Server-fetched comments are passed as initial state. All mutations
 * are optimistic and handled client-side.
 */
export function CommentSection({ slug, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const { user, isAuthenticated, isAdmin } = useCurrentUser();
  const router = useRouter();

  const handleAddComment = (newComment: Comment) => {
    setComments((prev) => [...prev, { ...newComment, replies: [] }]);
  };

  const handleDelete = (id: string, parentId: string | null) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies?.filter((r) => r.id !== id) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleReply = (parentId: string, newReply: Comment) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), newReply] }
          : c
      )
    );
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-xl font-bold">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      <Separator />

      {/* Add comment */}
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <CommentForm slug={slug} onSuccess={handleAddComment} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Sign in to join the conversation.
          </p>
          <Button size="sm" onClick={() => router.push("/login")}>
            Sign In to Comment
          </Button>
        </div>
      )}

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </section>
  );
}
