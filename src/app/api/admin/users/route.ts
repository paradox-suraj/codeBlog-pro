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
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / perPage) });
}

const patchSchema = z.object({
  role: z.enum(["ADMIN", "AUTHOR", "READER"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const url = req.nextUrl;
  const userId = url.searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (userId === admin.id) return NextResponse.json({ error: "Cannot modify own role" }, { status: 400 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await db.user.update({
    where: { id: userId },
    data: { ...(parsed.data.role && { role: parsed.data.role }) },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (userId === admin.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await db.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
