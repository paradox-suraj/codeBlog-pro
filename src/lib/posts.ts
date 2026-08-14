import { db } from "@/lib/db";
import { calculateReadingTime, generateSlug } from "@/lib/utils";
import type { PostStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const POST_PAGE_SIZE = 12;

/** Prisma select shape reused across list-style queries. */
const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  status: true,
  featured: true,
  readingTime: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { avatar: true } },
    },
  },
  category: {
    select: { id: true, name: true, slug: true, color: true },
  },
  tags: {
    select: {
      tag: { select: { id: true, name: true, slug: true, color: true } },
    },
  },
  _count: { select: { likes: true, comments: true, bookmarks: true } },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GetAllPostsOptions {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
  status?: PostStatus;
  featured?: boolean;
  authorId?: string;
  query?: string;
  orderBy?: "createdAt" | "views" | "updatedAt";
  order?: "asc" | "desc";
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated list of posts with optional category, tag, and author filters.
 * Defaults to published posts ordered by newest first.
 */
export async function getAllPosts(options: GetAllPostsOptions = {}) {
  const {
    page = 1,
    perPage = POST_PAGE_SIZE,
    categorySlug,
    tagSlug,
    status = "PUBLISHED",
    featured,
    authorId,
    query,
    orderBy = "createdAt",
    order = "desc",
  } = options;

  const skip = (page - 1) * perPage;

  const where = {
    status,
    ...(featured !== undefined && { featured }),
    ...(authorId && { authorId }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
    ...(query?.trim() && {
      OR: [
        { title: { contains: query.trim(), mode: "insensitive" as const } },
        { excerpt: { contains: query.trim(), mode: "insensitive" as const } },
        { content: { contains: query.trim(), mode: "insensitive" as const } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      select: postCardSelect,
      orderBy: { [orderBy]: order },
      skip,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return {
    posts,
    total,
    page,
    perPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Fetches a single published post by slug, including all relations
 * needed to render the full post page.
 */
export async function getPostBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      status: true,
      featured: true,
      readingTime: true,
      views: true,
      shares: true,
      scheduledAt: true,
      authorId: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: {
              bio: true,
              avatar: true,
              twitter: true,
              github: true,
              website: true,
            },
          },
        },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
      tags: {
        select: {
          tag: { select: { id: true, name: true, slug: true, color: true } },
        },
      },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
  });
}

/**
 * Returns previous and next published posts relative to a given date.
 */
export async function getAdjacentPosts(createdAt: Date) {
  const [prev, next] = await Promise.all([
    db.post.findFirst({
      where: { status: "PUBLISHED", createdAt: { lt: createdAt } },
      orderBy: { createdAt: "desc" },
      select: { title: true, slug: true },
    }),
    db.post.findFirst({
      where: { status: "PUBLISHED", createdAt: { gt: createdAt } },
      orderBy: { createdAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  return { prev, next };
}

/**
 * Returns top 3 featured published posts, ordered by newest.
 */
export async function getFeaturedPosts() {
  return db.post.findMany({
    where: { status: "PUBLISHED", featured: true },
    select: postCardSelect,
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

/**
 * Returns related posts based on shared tags, excluding the current post.
 * Falls back to latest posts in the same category if not enough matches.
 */
export async function getRelatedPosts(postId: string, tagIds: string[]) {
  const related = await db.post.findMany({
    where: {
      id: { not: postId },
      status: "PUBLISHED",
      tags: { some: { tagId: { in: tagIds } } },
    },
    select: postCardSelect,
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return related;
}

/**
 * Paginated list of posts by a specific author.
 */
export async function getPostsByAuthor(authorId: string, page = 1) {
  return getAllPosts({ authorId, page, status: "PUBLISHED" });
}

/**
 * Full-text search across title, excerpt, and content.
 * Uses PostgreSQL ILIKE for case-insensitive matching.
 */
export async function searchPosts(query: string, page = 1, sort = "latest") {
  const q = query.trim();
  if (!q) return { posts: [], total: 0, page, perPage: POST_PAGE_SIZE, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  const skip = (page - 1) * POST_PAGE_SIZE;

  const where = {
    status: "PUBLISHED" as PostStatus,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "popular") {
    orderBy = { views: "desc" };
  } else if (sort === "trending") {
    orderBy = { updatedAt: "desc" };
  }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      select: postCardSelect,
      orderBy,
      skip,
      take: POST_PAGE_SIZE,
    }),
    db.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / POST_PAGE_SIZE);
  return {
    posts,
    total,
    page,
    perPage: POST_PAGE_SIZE,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePostData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status?: PostStatus;
  featured?: boolean;
  scheduledAt?: Date | null;
  categoryId?: string | null;
  tagIds?: string[];
}

/**
 * Creates a new post. Calculates reading time from content.
 * Tags are connected via the PostTag join table.
 */
export async function createPost(data: CreatePostData, authorId: string) {
  const slug = data.slug ?? generateSlug(data.title);
  const readingTime = calculateReadingTime(data.content);
  const { tagIds = [], ...rest } = data;

  return db.post.create({
    data: {
      ...rest,
      slug,
      readingTime,
      authorId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    select: postCardSelect,
  });
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id?: string;
}

/**
 * Updates a post. Only the author or an admin may update.
 * Tags are replaced wholesale via deleteMany + create.
 */
export async function updatePost(
  id: string,
  data: UpdatePostData,
  authorId: string,
  isAdmin = false
) {
  const post = await db.post.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found.");
  if (!isAdmin && post.authorId !== authorId) throw new Error("Unauthorized.");

  const { tagIds, ...rest } = data;

  if (rest.content) {
    (rest as UpdatePostData & { readingTime?: number }).readingTime =
      calculateReadingTime(rest.content);
  }

  if (rest.title && !rest.slug) {
    rest.slug = generateSlug(rest.title);
  }

  return db.post.update({
    where: { id },
    data: {
      ...rest,
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      }),
    },
    select: postCardSelect,
  });
}

/**
 * Deletes a post. Only the author or an admin may delete.
 */
export async function deletePost(
  id: string,
  authorId: string,
  isAdmin = false
) {
  const post = await db.post.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found.");
  if (!isAdmin && post.authorId !== authorId) throw new Error("Unauthorized.");

  return db.post.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records a post view, de-duplicating by userId (if authenticated) or
 * IP hash (if anonymous). Increments the denormalized views counter.
 * Returns the new view count.
 */
export async function incrementViewCount(
  postId: string,
  userId?: string,
  ipHash?: string
): Promise<number> {
  // De-duplicate: check for existing view in the last 24h
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await db.postView.findFirst({
    where: {
      postId,
      viewedAt: { gte: windowStart },
      ...(userId ? { userId } : ipHash ? { ipHash } : { id: "never" }),
    },
    select: { id: true },
  });

  if (existing) {
    // Already viewed — return current count
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { views: true },
    });
    return post?.views ?? 0;
  }

  const [updated] = await db.$transaction([
    db.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
      select: { views: true },
    }),
    db.postView.create({
      data: { postId, userId, ipHash },
    }),
  ]);

  return updated.views;
}

/**
 * Toggles a like on a post. Returns the new like count and liked state.
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const existing = await db.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  if (existing) {
    await db.like.delete({
      where: { userId_postId: { userId, postId } },
    });
  } else {
    await db.like.create({ data: { userId, postId } });
  }

  const count = await db.like.count({ where: { postId } });
  return { liked: !existing, count };
}

/**
 * Toggles a bookmark on a post. Returns the new saved state.
 */
export async function toggleBookmark(
  postId: string,
  userId: string
): Promise<{ bookmarked: boolean }> {
  const existing = await db.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  if (existing) {
    await db.bookmark.delete({
      where: { userId_postId: { userId, postId } },
    });
    return { bookmarked: false };
  }

  await db.bookmark.create({ data: { userId, postId } });
  return { bookmarked: true };
}

/**
 * Returns whether a user has liked and/or bookmarked a specific post.
 * Returns null states for unauthenticated users.
 */
export async function getUserPostInteractions(
  postId: string,
  userId?: string
): Promise<{ liked: boolean; bookmarked: boolean }> {
  if (!userId) return { liked: false, bookmarked: false };

  const [like, bookmark] = await Promise.all([
    db.like.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true },
    }),
    db.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true },
    }),
  ]);

  return { liked: !!like, bookmarked: !!bookmark };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

const commentSelect = {
  id: true,
  content: true,
  postId: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { avatar: true } },
    },
  },
} as const;

/**
 * Returns all top-level comments for a post with one level of replies.
 */
export async function getCommentsByPost(postId: string) {
  const comments = await db.comment.findMany({
    where: { postId, parentId: null },
    select: {
      ...commentSelect,
      replies: {
        select: commentSelect,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments;
}

/**
 * Creates a new comment or reply on a post.
 */
export async function createComment(data: {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
}) {
  return db.comment.create({
    data: {
      content: data.content,
      postId: data.postId,
      authorId: data.authorId,
      parentId: data.parentId ?? null,
    },
    select: {
      ...commentSelect,
      replies: { select: commentSelect },
    },
  });
}

/**
 * Deletes a comment. Only the author or an admin can delete.
 */
export async function deleteComment(
  id: string,
  userId: string,
  isAdmin = false
) {
  const comment = await db.comment.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!comment) throw new Error("Comment not found.");
  if (!isAdmin && comment.authorId !== userId) throw new Error("Unauthorized.");

  return db.comment.delete({ where: { id } });
}

/**
 * Updates a comment. Only the author can edit.
 */
export async function updateComment(
  id: string,
  content: string,
  userId: string
) {
  const comment = await db.comment.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!comment) throw new Error("Comment not found.");
  if (comment.authorId !== userId) throw new Error("Unauthorized.");

  return db.comment.update({
    where: { id },
    data: { content },
    select: {
      ...commentSelect,
      replies: { select: commentSelect },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES & TAGS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all categories with post count. */
export async function getAllCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
  });
}

/** Returns a single category by slug. */
export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

/** Returns all tags with post count. */
export async function getAllTags() {
  return db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

/** Returns a single tag by slug. */
export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({ where: { slug } });
}
