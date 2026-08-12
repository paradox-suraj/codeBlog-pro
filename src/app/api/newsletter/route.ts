import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email, name } = parsed.data;

  const existing = await db.newsletter.findUnique({ where: { email } });
  if (existing) {
    if (existing.active) {
      return NextResponse.json({ message: "Already subscribed" });
    }
    await db.newsletter.update({ where: { email }, data: { active: true } });
    return NextResponse.json({ success: true });
  }

  await db.newsletter.create({ data: { email, name, confirmed: false } });
  return NextResponse.json({ success: true });
}
