import { NextRequest, NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import readingTime from "reading-time";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (body.content) {
    const stats = readingTime(body.content);
    body.readingTime = Math.ceil(stats.minutes);
  }

  const updated = await db.post.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}
