import { requireAuthor } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { PostForm } from "@/components/dashboard/PostForm";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const user = await requireAuthor();
  
  const [post, categories] = await Promise.all([
    db.post.findUnique({ where: { id: params.id } }),
    db.category.findMany({ select: { id: true, name: true } }),
  ]);

  if (!post) notFound();
  if (post.authorId !== user.id && user.role !== "ADMIN") notFound();

  return <PostForm initialData={post} categories={categories} />;
}
