import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Github, Globe, Linkedin, Twitter } from "lucide-react";
import { db } from "@/lib/db";
import { getPostsByAuthor } from "@/lib/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/PostCard";
import { MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { FollowButton } from "@/components/user/FollowButton";

interface Props {
  params: { id: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, email: true, profile: { select: { bio: true } } },
  });

  if (!author) return { title: "Author Not Found" };

  const name = author.name ?? author.email ?? "Author";
  return {
    title: `${name} — CodeBlog Pro`,
    description: author.profile?.bio ?? `Published articles by ${name}.`,
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page ?? "1");

  const [author, postsResult, session] = await Promise.all([
    db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profile: {
          select: {
            bio: true,
            avatar: true,
            website: true,
            twitter: true,
            github: true,
            linkedin: true,
            location: true,
            skills: true,
            experience: true,
          },
        },
      },
    }),
    getPostsByAuthor(params.id, page),
    auth(),
  ]);

  let isFollowing = false;
  if (session?.user?.id) {
    const follow = await db.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  if (!author) notFound();

  const displayName = author.name ?? author.email ?? "Unnamed author";
  const avatar = author.profile?.avatar ?? author.image ?? undefined;

  return (
    <div className="container py-10 md:py-14">
      <section className="rounded-lg border bg-card/88 p-6 shadow-soft md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt="" />
              <AvatarFallback className="text-xl">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">
                  {author.role.toLowerCase()}
                </Badge>
                <FollowButton authorId={author.id} initialIsFollowing={isFollowing} />
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {displayName}
              </h1>
              {author.profile?.location && (
                <p className="flex items-center text-sm text-muted-foreground mt-2 font-medium">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  {author.profile.location}
                </p>
              )}
              {author.profile?.bio && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {author.profile.bio}
                </p>
              )}
              {author.profile?.skills && author.profile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {author.profile.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {author.profile?.website && (
              <Button asChild variant="outline" size="sm">
                <a href={author.profile.website} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            {author.profile?.github && (
              <Button asChild variant="outline" size="sm">
                <a href={`https://github.com/${author.profile.github}`} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
            {author.profile?.twitter && (
              <Button asChild variant="outline" size="sm">
                <a href={`https://twitter.com/${author.profile.twitter.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </Button>
            )}
            {author.profile?.linkedin && (
              <Button asChild variant="outline" size="sm">
                <a href={normalizeLinkedIn(author.profile.linkedin)} target="_blank" rel="noreferrer">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>

        {author.profile?.experience && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-semibold uppercase text-primary mb-4">Experience & Background</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground max-w-3xl">
              {author.profile.experience}
            </p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Published work</p>
            <h2 className="text-2xl font-bold tracking-tight">
              {postsResult.total} {postsResult.total === 1 ? "article" : "articles"}
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/authors">All authors</Link>
          </Button>
        </div>

        {postsResult.posts.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card/70 px-6 py-14 text-center">
            <h3 className="text-xl font-bold">No published articles yet</h3>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {postsResult.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {postsResult.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {postsResult.hasPreviousPage ? (
              <Button asChild variant="outline">
                <Link href={`/authors/${params.id}?page=${page - 1}`}>Previous</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>Previous</Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {postsResult.totalPages}
            </span>
            {postsResult.hasNextPage ? (
              <Button asChild variant="outline">
                <Link href={`/authors/${params.id}?page=${page + 1}`}>Next</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>Next</Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function normalizeLinkedIn(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value.replace(/^\/+/, "")}`;
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
