import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import { db } from "@/lib/db";

interface RouteContext {
  params: { slug: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Increment share count
    const updatedPost = await db.post.update({
      where: { id: post.id },
      data: { shares: { increment: 1 } },
      select: { shares: true }
    });

    return NextResponse.json({ shares: updatedPost.shares });
  } catch (error) {
    console.error(`[POST /api/posts/${params.slug}/share]`, error);
    return NextResponse.json({ error: "Failed to track share." }, { status: 500 });
  }
}
