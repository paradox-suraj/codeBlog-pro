import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostBySlug, getCommentsByPost, createComment, deleteComment } from "@/lib/posts";
import { createCommentSchema } from "@/lib/validations";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const comments = await getCommentsByPost(post.id);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error(`[GET /api/posts/${params.slug}/comments]`, error);
    return NextResponse.json({ error: "Failed to fetch comments." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to comment." },
        { status: 401 }
      );
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createCommentSchema.safeParse({ ...body, postId: post.id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const comment = await createComment({
      content: parsed.data.content,
      postId: post.id,
      authorId: session.user.id,
      parentId: parsed.data.parentId ?? undefined,
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error(`[POST /api/posts/${params.slug}/comments]`, error);
    return NextResponse.json({ error: "Failed to create comment." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ error: "commentId is required." }, { status: 400 });
    }

    const isAdmin = session.user.role === "ADMIN";
    await deleteComment(commentId, session.user.id, isAdmin);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete comment.";
    const status = message === "Unauthorized." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
