import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { z } from "zod";
import readingTime from "reading-time";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  featured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const data = parsed.data;
  const stats = readingTime(data.content);

  const existingSlug = await db.post.findUnique({ where: { slug: data.slug } });
  if (existingSlug) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const post = await db.post.create({
    data: {
      ...data,
      authorId: user.id,
      readingTime: Math.ceil(stats.minutes),
    },
  });

  revalidateTag("posts");

  return NextResponse.json(post);
}
