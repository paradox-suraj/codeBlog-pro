import { streamText } from "ai";
import { getReasoningModel } from "@/lib/ai/provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, action, textToImprove } = await req.json();
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (!session || !userId || (userRole !== "AUTHOR" && userRole !== "ADMIN")) {
      return new Response("Unauthorized", { status: 401 });
    }

    let systemPrompt = `You are a professional AI Writing Assistant and Editor for CodeBlog. 
Your goal is to help authors create, improve, and optimize their content.
You only output the raw improved content unless conversational chat is requested.`;

    if (action === "improve" && textToImprove) {
      systemPrompt += `\nThe author has selected the following text to improve. Rewrite it to be clear, concise, and professional. 
Text to improve:
${textToImprove}`;
    }

    const model = getReasoningModel(); // use higher quality model for authoring

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      onFinish: async ({ usage }) => {
        try {
          await db.aIUsage.create({
            data: {
              userId,
              model: model.modelId,
              requestType: action || "authoring",
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
    console.error("AI Author Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
