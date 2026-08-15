import { requireAuthor } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FileText, Eye, Heart, TrendingUp, Users, Bookmark } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DashboardChart } from "@/components/dashboard/DashboardChart";

async function getDashboardData(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalPosts, totalViewsAgg, totalLikes, totalFollowers, totalBookmarks, topPosts, viewsOverTime] = await Promise.all([
    db.post.count({ where: { authorId: userId } }),
    db.post.aggregate({ where: { authorId: userId }, _sum: { views: true } }),
    db.like.count({ where: { post: { authorId: userId } } }),
    db.follows.count({ where: { followingId: userId } }),
    db.bookmark.count({ where: { post: { authorId: userId } } }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true, title: true, slug: true, status: true, views: true, createdAt: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    db.postView.findMany({
      where: { post: { authorId: userId }, viewedAt: { gte: thirtyDaysAgo } },
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

  return { totalPosts, totalViews: totalViewsAgg._sum.views ?? 0, totalLikes, totalFollowers, totalBookmarks, topPosts, chartData };
}

const STATUS_COLOR: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  SCHEDULED: "outline",
};

export default async function DashboardPage() {
  const user = await requireAuthor();
  const { totalPosts, totalViews, totalLikes, totalFollowers, totalBookmarks, topPosts, chartData } = await getDashboardData(user.id!);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name?.split(" ")[0] ?? "Author"}! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard title="Total Posts" value={totalPosts} icon={FileText} description="All your posts" />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} description="Across all posts" />
        <StatsCard title="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} description="Received on all posts" />
        <StatsCard title="Followers" value={totalFollowers.toLocaleString()} icon={Users} description="People following you" />
        <StatsCard title="Bookmarks" value={totalBookmarks.toLocaleString()} icon={Bookmark} description="Posts saved by users" />
      </div>

      {/* Views Chart */}
      <div className="rounded-[32px] border-2 border-border bg-card p-6 shadow-sm overflow-hidden">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Views — Last 30 Days</h2>
        </div>
        <DashboardChart data={chartData} />
      </div>

      {/* Top Posts */}
      <div className="rounded-[32px] border-2 border-border bg-card shadow-sm overflow-hidden mt-8">
        <div className="flex items-center justify-between border-b-2 border-border bg-secondary/30 px-8 py-5">
          <h2 className="text-xl font-bold">Top Performing Posts</h2>
          <Link href="/dashboard/posts" className="text-sm font-bold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-full">View all</Link>
        </div>
        <div className="divide-y">
          {topPosts.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No posts yet. <Link href="/dashboard/posts/new" className="text-primary hover:underline">Create your first post</Link>
            </div>
          ) : topPosts.map((post) => (
            <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4">
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/posts/${post.id}/edit`} className="truncate text-sm font-medium hover:text-primary">
                  {post.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{format(post.createdAt, "MMM d, yyyy")}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post._count.likes}</span>
                </div>
                <Badge variant={STATUS_COLOR[post.status]}>{post.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
