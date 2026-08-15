import { requireAuthor } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { PostForm } from "@/components/dashboard/PostForm";

export default async function NewPostPage() {
  await requireAuthor();
  const [categories, series] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true } }),
    db.series.findMany({ select: { id: true, title: true } }),
  ]);

  return <PostForm categories={categories} series={series} />;
}
