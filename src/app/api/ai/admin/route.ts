import { streamText, tool } from "ai";
import { getReasoningModel } from "@/lib/ai/provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (!session || !userId || userRole !== "ADMIN") {
      return new Response("Unauthorized", { status: 401 });
    }

    const systemPrompt = `You are a Platform AI Analytics Assistant for the administrators of CodeBlog. 
Your goal is to answer questions about platform metrics, trends, and content performance.
You have access to tools that can query real-time database statistics. DO NOT invent numbers. Use your tools to fetch data before answering numerical questions.`;

    const model = getReasoningModel(); // Requires a powerful model to use tools accurately

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      tools: {
        getOverallPlatformStats: tool({
          description: 'Get the total number of users, posts, comments, likes, and views on the entire platform.',
          parameters: z.object({
            dummy: z.boolean().optional().describe("Not used")
          }),
          // @ts-ignore
          execute: async (_args) => {
            const [users, posts, comments, likes, views] = await Promise.all([
              db.user.count(),
              db.post.count({ where: { status: 'PUBLISHED' } }),
              db.comment.count(),
              db.like.count(),
              db.postView.count(),
            ]);
            return { users, publishedPosts: posts, comments, likes, totalViews: views };
          },
        }),
        getTopCategories: tool({
          description: 'Get a list of categories ordered by the number of posts in them.',
          parameters: z.object({
            limit: z.number().optional().describe("Number of categories to return, default 5")
          }),
          // @ts-ignore
          execute: async ({ limit }) => {
            const categories = await db.category.findMany({
              include: { _count: { select: { posts: true } } },
              orderBy: { posts: { _count: 'desc' } },
              take: limit || 5
            });
            return categories.map(c => ({ name: c.name, postCount: c._count.posts }));
          },
        }),
      },
      onFinish: async ({ usage }) => {
        try {
          await db.aIUsage.create({
            data: {
              userId,
              model: model.modelId,
              requestType: "analytics",
              tokens: usage.totalTokens,
            }
          });
        } catch (e) {
          console.error("Failed to log AI usage", e);
        }
      },
    });

    return (result as any).toDataStreamResponse();
  } catch (error) {
    console.error("AI Admin Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
