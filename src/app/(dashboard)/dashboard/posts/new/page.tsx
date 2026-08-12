import { requireAuthor } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { PostForm } from "@/components/dashboard/PostForm";

export default async function NewPostPage() {
  await requireAuthor();
  const categories = await db.category.findMany({ select: { id: true, name: true } });

  return <PostForm categories={categories} />;
}
