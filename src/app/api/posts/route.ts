import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllPosts, createPost } from "@/lib/posts";
import { createPostSchema } from "@/lib/validations";
import { unstable_cache } from "next/cache";

const getCachedPosts = unstable_cache(
  async (options) => getAllPosts(options),
  ["public-posts"],
  { tags: ["posts"], revalidate: 3600 }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("perPage") ?? "12");
    const categorySlug = searchParams.get("category") ?? undefined;
    const tagSlug = searchParams.get("tag") ?? undefined;
    const query = searchParams.get("q") ?? undefined;

    const result = await getCachedPosts({ page, perPage, categorySlug, tagSlug, query });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/posts]", error);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "AUTHOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only authors and admins can create posts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      }
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors },
        { status: 400 }
      );
    }

    const post = await createPost(parsed.data, session.user.id);
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
