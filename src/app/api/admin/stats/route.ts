import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminAPI();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalPosts, totalViews, totalSubscribers, recentSignups, recentPosts, viewsByMonth] =
    await Promise.all([
      db.user.count(),
      db.post.count(),
      db.post.aggregate({ _sum: { views: true } }),
      db.newsletter.count({ where: { active: true } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
      }),
      db.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      db.postView.findMany({
        where: { viewedAt: { gte: thirtyDaysAgo } },
        select: { viewedAt: true },
      }),
    ]);

  // Group views by day (last 30 days)
  const viewsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    viewsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of viewsByMonth) {
    const key = v.viewedAt.toISOString().slice(0, 10);
    if (typeof viewsByDay[key] === "number") {
      viewsByDay[key] += 1;
    }
  }
  const chartData = Object.entries(viewsByDay).map(([date, views]) => ({ date, views }));

  return NextResponse.json({
    totalUsers,
    totalPosts,
    totalViews: totalViews._sum.views ?? 0,
    totalSubscribers,
    recentSignups,
    recentPosts,
    chartData,
  });
}
