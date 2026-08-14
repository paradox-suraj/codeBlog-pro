import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "User Dashboard - CodeBlog Pro",
};

export default async function UserDashboard() {
  const user = await requireAuth();

  // Fetch some stats for the user
  const [bookmarkCount, commentCount] = await Promise.all([
    db.bookmark.count({ where: { userId: user.id } }),
    db.comment.count({ where: { authorId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your bookmarks, comments, and profile from your personal dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Saved Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{bookmarkCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Articles saved for later</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Comments Left</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{commentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Engagements on posts</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="border-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to your content</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
             <Link href="/user/bookmarks" className="text-sm font-medium hover:underline text-primary">
               View your reading list &rarr;
             </Link>
             <Link href="/user/comments" className="text-sm font-medium hover:underline text-primary">
               Review your comments &rarr;
             </Link>
             <Link href="/user/profile" className="text-sm font-medium hover:underline text-primary">
               Update your profile &rarr;
             </Link>
          </CardContent>
         </Card>
      </div>
    </div>
  );
}
