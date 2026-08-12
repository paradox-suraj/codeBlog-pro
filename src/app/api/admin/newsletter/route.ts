import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 50);
  const skip = (page - 1) * perPage;

  const [subscribers, total, activeCount, confirmedCount] = await Promise.all([
    db.newsletter.findMany({
      orderBy: { subscribedAt: "desc" },
      skip,
      take: perPage,
    }),
    db.newsletter.count(),
    db.newsletter.count({ where: { active: true } }),
    db.newsletter.count({ where: { confirmed: true } }),
  ]);

  return NextResponse.json({
    subscribers,
    total,
    activeCount,
    confirmedCount,
    page,
    totalPages: Math.ceil(total / perPage),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.newsletter.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
