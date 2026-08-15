import { NextRequest, NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { z } from "zod";
import readingTime from "reading-time";
import { revalidateTag } from "next/cache";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }
  
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const updateData: any = { ...parsed.data };
  if (updateData.content) {
    const stats = readingTime(updateData.content);
    updateData.readingTime = Math.ceil(stats.minutes);
  }

  if (updateData.slug && updateData.slug !== post.slug) {
    const existing = await db.post.findUnique({ where: { slug: updateData.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const updated = await db.post.update({
    where: { id: params.id },
    data: updateData,
  });

  revalidateTag("posts");
  revalidateTag(`post-${updated.slug}`);

  return NextResponse.json(updated);
}
