"use server";

import { db } from "@/lib/db";
import { requireAuthor } from "@/lib/auth-utils";
import slugify from "slugify";

export async function createSeries(data: { title: string; description?: string }) {
  try {
    const user = await requireAuthor();

    const slug = slugify(data.title, { lower: true, strict: true });

    const series = await db.series.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        authorId: user.id,
      },
    });

    return { success: true, series };
  } catch (error: any) {
    console.error("[CREATE_SERIES]", error);
    // Handle unique constraint if slug already exists
    if (error?.code === "P2002") {
      return { error: "A series with this title already exists." };
    }
    return { error: "Failed to create series" };
  }
}

export async function getAuthorSeries() {
  try {
    const user = await requireAuthor();

    const series = await db.series.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, series };
  } catch (error) {
    console.error("[GET_AUTHOR_SERIES]", error);
    return { error: "Failed to fetch series", series: [] };
  }
}
