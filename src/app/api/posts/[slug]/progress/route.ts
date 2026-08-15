import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireAuthAPI();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { progress } = await req.json();

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "Invalid progress value" }, { status: 400 });
    }

    // Resolve slug to post ID
    const post = await db.post.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const readingProgress = await db.readingProgress.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
      update: {
        progress: Math.round(progress),
        lastRead: new Date(),
      },
      create: {
        userId: user.id,
        postId: post.id,
        progress: Math.round(progress),
      },
    });

    return NextResponse.json({ success: true, progress: readingProgress.progress });
  } catch (error) {
    console.error("[POST_PROGRESS]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
