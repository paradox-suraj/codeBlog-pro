import { NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireAuthorAPI();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalPosts, totalViews, totalLikes, viewsOverTime] = await Promise.all([
    db.post.count({ where: { authorId: user.id } }),
    db.post.aggregate({
      where: { authorId: user.id },
      _sum: { views: true },
    }),
    db.like.count({
      where: { post: { authorId: user.id } },
    }),
    db.postView.findMany({
      where: {
        post: { authorId: user.id },
        viewedAt: { gte: thirtyDaysAgo },
      },
      select: { viewedAt: true },
      orderBy: { viewedAt: "asc" },
    }),
  ]);

  // Group views by day
  const viewsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    viewsByDay[key] = 0;
  }
  for (const v of viewsOverTime) {
    const key = v.viewedAt.toISOString().slice(0, 10);
    if (typeof viewsByDay[key] === "number") {
      viewsByDay[key] += 1;
    }
  }

  const chartData = Object.entries(viewsByDay).map(([date, views]) => ({
    date,
    views,
  }));

  return NextResponse.json({
    totalPosts,
    totalViews: totalViews._sum.views ?? 0,
    totalLikes,
    chartData,
  });
}
