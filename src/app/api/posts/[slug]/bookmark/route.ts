import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostBySlug, toggleBookmark } from "@/lib/posts";

interface RouteContext {
  params: { slug: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to bookmark posts." },
        { status: 401 }
      );
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const result = await toggleBookmark(post.id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[POST /api/posts/${params.slug}/bookmark]`, error);
    return NextResponse.json({ error: "Failed to toggle bookmark." }, { status: 500 });
  }
}
