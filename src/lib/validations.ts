import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be under 72 characters.") // bcrypt limit
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character."
  );

const slugSchema = z
  .string()
  .min(1, "Slug is required.")
  .max(200, "Slug must be under 200 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers, and hyphens."
  );

const urlSchema = z
  .string()
  .url("Please enter a valid URL (include https://).")
  .optional()
  .or(z.literal(""));

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for the Email/Password login form.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for the new user registration form.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be under 50 characters."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// POST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for creating a new blog post.
 * Used in the author editor Server Action.
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title must be under 120 characters."),
  slug: slugSchema,
  excerpt: z
    .string()
    .max(300, "Excerpt must be under 300 characters.")
    .optional()
    .or(z.literal("")),
  content: z.string().min(50, "Content must be at least 50 characters."),
  coverImage: z.string().url("Invalid cover image URL.").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  scheduledAt: z.coerce.date().optional().nullable(),
  categoryId: z.string().cuid("Invalid category.").optional().nullable(),
  tagIds: z.array(z.string().cuid()).optional().default([]),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * Schema for updating an existing blog post.
 * All fields are optional to allow partial updates.
 */
export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().cuid("Invalid post ID."),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for submitting a comment or a reply.
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(3, "Comment must be at least 3 characters.")
    .max(2000, "Comment must be under 2000 characters."),
  postId: z.string().cuid("Invalid post ID."),
  parentId: z.string().cuid().optional().nullable(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for updating a user's public profile information.
 */
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be under 50 characters."),
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters.")
    .optional()
    .or(z.literal("")),
  website: urlSchema,
  twitter: z
    .string()
    .max(15, "Twitter handle must be under 15 characters.")
    .regex(/^[A-Za-z0-9_]*$/, "Invalid Twitter handle.")
    .optional()
    .or(z.literal("")),
  github: z
    .string()
    .max(39, "GitHub username must be under 39 characters.")
    .regex(/^[A-Za-z0-9-]*$/, "Invalid GitHub username.")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .max(100)
    .optional()
    .or(z.literal("")),
  avatar: z.string().url("Invalid avatar URL.").optional().or(z.literal("")),
});
export type UserProfileInput = z.infer<typeof userProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for newsletter subscription form.
 */
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be under 50 characters.")
    .optional()
    .or(z.literal("")),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY & TAG SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name must be under 50 characters."),
  slug: slugSchema,
  description: z.string().max(300).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color.")
    .optional()
    .or(z.literal("")),
  icon: z.string().max(10).optional().or(z.literal("")),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required.")
    .max(30, "Tag name must be under 30 characters."),
  slug: slugSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color.")
    .optional()
    .or(z.literal("")),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for an admin changing a user's role.
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid("Invalid user ID."),
  role: z.enum(["ADMIN", "AUTHOR", "READER"]),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
