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

  const [author, postsResult] = await Promise.all([
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
          },
        },
      },
    }),
    getPostsByAuthor(params.id, page),
  ]);

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
              <Badge variant="secondary" className="mb-3">
                {author.role.toLowerCase()}
              </Badge>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {displayName}
              </h1>
              {author.profile?.bio && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  {author.profile.bio}
                </p>
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
