import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostBySlug, toggleLike } from "@/lib/posts";

interface RouteContext {
  params: { slug: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to like posts." },
        { status: 401 }
      );
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const result = await toggleLike(post.id, session.user.id);

    if (result.liked && post.authorId !== session.user.id) {
      const { db } = await import("@/lib/db");
      await db.notification.create({
        data: {
          userId: post.authorId,
          type: "LIKE",
          message: `${session.user.name || 'Someone'} liked your post "${post.title}"`,
          link: `/blog/${post.slug}`,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[POST /api/posts/${params.slug}/like]`, error);
    return NextResponse.json({ error: "Failed to toggle like." }, { status: 500 });
  }
}
