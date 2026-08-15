import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const sendSchema = z.object({
  subject: z.string().min(1),
  content: z.string().min(10), // HTML content
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdminAPI();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { subject, content } = parsed.data;

    // Fetch active subscribers
    const subscribers = await db.newsletter.findMany({
      where: { active: true },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found." }, { status: 400 });
    }

    // Send emails in batches using Resend
    // Resend supports batch sending up to 100 emails at a time
    const BATCH_SIZE = 100;
    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const emails = batch.map((s) => s.email);

      await resend.emails.send({
        from: "CodeBlog Pro <noreply@codeblogpro.com>",
        to: emails,
        subject: subject,
        html: content,
      });

      sentCount += emails.length;
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    console.error("[POST /api/admin/newsletter/send]", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
