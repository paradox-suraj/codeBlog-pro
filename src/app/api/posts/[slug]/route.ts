import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostBySlug, updatePost, deletePost } from "@/lib/posts";
import { updatePostSchema } from "@/lib/validations";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(`[GET /api/posts/${params.slug}]`, error);
    return NextResponse.json({ error: "Failed to fetch post." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updatePostSchema.safeParse({ ...body, id: post.id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const updated = await updatePost(post.id, parsed.data, session.user.id, isAdmin);
    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post.";
    const status = message === "Unauthorized." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    await deletePost(post.id, session.user.id, isAdmin);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete post.";
    const status = message === "Unauthorized." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
