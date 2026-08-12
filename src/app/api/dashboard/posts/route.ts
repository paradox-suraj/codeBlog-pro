import { NextRequest, NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = req.nextUrl;

  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 20);
  const status = searchParams.get("status");
  const search = searchParams.get("q") ?? "";
  const sortBy = (searchParams.get("sortBy") as "createdAt" | "views" | "updatedAt") ?? "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") ?? "desc";

  const where = {
    authorId: user.id,
    ...(status && status !== "all" ? { status: status as any } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const skip = (page - 1) * perPage;

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
        updatedAt: true,
        category: { select: { name: true, color: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  });
}

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "publish", "unpublish"]),
});

export async function POST(req: NextRequest) {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const parsed = bulkActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { ids, action } = parsed.data;

  // Verify ownership
  const posts = await db.post.findMany({
    where: { id: { in: ids }, authorId: user.id },
    select: { id: true },
  });

  if (posts.length !== ids.length) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (action === "delete") {
    await db.post.deleteMany({ where: { id: { in: ids } } });
  } else {
    const newStatus = action === "publish" ? "PUBLISHED" : "DRAFT";
    await db.post.updateMany({
      where: { id: { in: ids } },
      data: { status: newStatus },
    });
  }

  return NextResponse.json({ success: true });
}
