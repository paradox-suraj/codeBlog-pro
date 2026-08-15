"use server";

import { db } from "@/lib/db";
import { requireAuthor } from "@/lib/auth-utils";
import { calculateReadingTime } from "@/lib/utils";

export async function autosavePost(
  postId: string,
  data: { title: string; slug: string; content: string; excerpt?: string; categoryId?: string | null; seriesId?: string | null; seriesOrder?: number | null }
) {
  try {
    const user = await requireAuthor();

    // Verify ownership
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    const readingTime = calculateReadingTime(data.content);
    
    await db.$transaction([
      db.post.update({
        where: { id: postId },
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          categoryId: data.categoryId || null,
          seriesId: data.seriesId || null,
          seriesOrder: data.seriesOrder || null,
          readingTime,
        },
      }),
      db.postVersion.create({
        data: {
          postId,
          title: data.title,
          content: data.content,
        },
      }),
    ]);

    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("[AUTOSAVE_POST]", error);
    return { error: "Failed to autosave" };
  }
}
