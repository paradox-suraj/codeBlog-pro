import type { Role, PostStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORT PRISMA ENUMS
// ─────────────────────────────────────────────────────────────────────────────
export type { Role, PostStatus };

// ─────────────────────────────────────────────────────────────────────────────
// USER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserBase {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
}

export interface UserWithProfile extends UserBase {
  profile: {
    bio: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    linkedin: string | null;
    avatar: string | null;
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PostCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: PostStatus;
  featured: boolean;
  readingTime: number | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    profile: { avatar: string | null } | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

export interface PostDetail extends PostCardData {
  content: string;
  scheduledAt: Date | null;
  authorId: string;
  categoryId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CommentWithAuthor {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    profile: { avatar: string | null } | null;
  };
  replies?: CommentWithAuthor[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY & TAG TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  _count: { posts: number };
}

export interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  _count: { posts: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthorAnalytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  publishedPosts: number;
  draftPosts: number;
  postsWithStats: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    createdAt: Date;
    _count: { likes: number; comments: number; bookmarks: number };
  }>;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalViews: number;
  recentUsers: UserBase[];
  recentPosts: PostCardData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "NEW_COMMENT"
  | "COMMENT_REPLY"
  | "NEW_LIKE"
  | "NEW_FOLLOWER"
  | "POST_FEATURED"
  | "SYSTEM";

export interface NotificationData {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION EXTENSION
// Auth.js Session type augmentation to include custom fields.
// ─────────────────────────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: Role;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
  }
}
