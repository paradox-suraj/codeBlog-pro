import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 20);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status");
  const skip = (page - 1) * perPage;

  const where: any = {
    ...(status && status !== "all" ? { status } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        views: true,
        createdAt: true,
        author: { select: { id: true, name: true, email: true } },
        category: { select: { name: true, color: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / perPage) });
}

const patchSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const postId = req.nextUrl.searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await db.post.update({
    where: { id: postId },
    data: parsed.data,
    select: { id: true, status: true, featured: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const postId = req.nextUrl.searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

  await db.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
