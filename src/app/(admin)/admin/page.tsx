import { requireAdmin } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, FileText, Eye, Mail, TrendingUp } from "lucide-react";
import { DashboardChart } from "@/components/dashboard/DashboardChart";

async function getAdminData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalPosts, totalViewsAgg, totalSubs, viewsOverTime] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.post.aggregate({ _sum: { views: true } }),
    db.newsletter.count({ where: { active: true } }),
    db.postView.findMany({
      where: { viewedAt: { gte: thirtyDaysAgo } },
      select: { viewedAt: true },
    }),
  ]);

  const viewsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    viewsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of viewsOverTime) {
    const key = v.viewedAt.toISOString().slice(0, 10);
    if (typeof viewsByDay[key] === "number") {
      viewsByDay[key] += 1;
    }
  }
  const chartData = Object.entries(viewsByDay).map(([date, views]) => ({ date, views }));

  return { totalUsers, totalPosts, totalViews: totalViewsAgg._sum.views ?? 0, totalSubs, chartData };
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { totalUsers, totalPosts, totalViews, totalSubs, chartData } = await getAdminData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Global statistics and administration.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} />
        <StatsCard title="Total Posts" value={totalPosts.toLocaleString()} icon={FileText} />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatsCard title="Subscribers" value={totalSubs.toLocaleString()} icon={Mail} />
      </div>

      <div className="rounded-[32px] border-2 border-border bg-card p-6 shadow-sm overflow-hidden">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10 shadow-sm">
            <TrendingUp className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Platform Views — Last 30 Days</h2>
        </div>
        <DashboardChart data={chartData} />
      </div>
    </div>
  );
}
