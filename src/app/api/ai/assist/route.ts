import { NextResponse } from "next/server";
import { requireAuthorAPI } from "@/lib/auth-utils";
import { generateObject } from "ai";
import { getFastModel } from "@/lib/ai/provider";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await requireAuthorAPI();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.length < 50) {
      return NextResponse.json(
        { error: "Content is too short to generate metadata." },
        { status: 400 }
      );
    }

    const result = await generateObject({
      model: getFastModel(),
      schema: z.object({
        excerpt: z.string().describe("A compelling 2-3 sentence summary of the blog post suitable for SEO and social sharing."),
        tags: z.array(z.string()).describe("3 to 5 relevant programming or technology tags (e.g., 'react', 'typescript', 'architecture')."),
      }),
      prompt: `Analyze the following blog post content and generate an SEO-friendly excerpt and a list of relevant tags.\n\nContent:\n${content.substring(0, 3000)}`,
    });

    return NextResponse.json({ success: true, data: result.object });
  } catch (error) {
    console.error("[POST /api/ai/assist]", error);
    return NextResponse.json(
      { error: "Failed to generate AI metadata" },
      { status: 500 }
    );
  }
}
