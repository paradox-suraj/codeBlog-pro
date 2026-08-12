import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Authors — CodeBlog Pro",
  description: "Browse CodeBlog Pro contributors and their published articles.",
};

export default async function AuthorsPage() {
  const authors = await db.user.findMany({
    where: {
      posts: { some: { status: "PUBLISHED" } },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      profile: {
        select: { bio: true, avatar: true, github: true, website: true },
      },
      _count: {
        select: { posts: { where: { status: "PUBLISHED" } } },
      },
    },
  });

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Contributors</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          Authors writing from experience
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Browse engineers and technical writers publishing practical notes on CodeBlog Pro.
        </p>
      </div>

      {authors.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card/70 px-6 py-14 text-center">
          <h2 className="text-xl font-bold">No published authors yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Authors will appear here after their first published post.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => {
            const displayName = author.name ?? author.email ?? "Unnamed author";
            const avatar = author.profile?.avatar ?? author.image ?? undefined;

            return (
              <Link
                key={author.id}
                href={`/authors/${author.id}`}
                className="group rounded-lg border bg-card/88 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={avatar} alt="" />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold group-hover:text-primary">
                      {displayName}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{author.role.toLowerCase()}</Badge>
                      <Badge variant="outline">
                        {author._count.posts} {author._count.posts === 1 ? "post" : "posts"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {author.profile?.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {author.profile.bio}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
