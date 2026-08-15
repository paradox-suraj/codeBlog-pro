import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuthAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireAuthAPI();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      image: true,
      profile: {
        select: {
          bio: true,
          website: true,
          twitter: true,
          github: true,
          linkedin: true,
          avatar: true,
          location: true,
          skills: true,
          experience: true,
        },
      },
    },
  });

  return NextResponse.json({
    profile: {
      name: profile?.name ?? "",
      avatar: profile?.profile?.avatar ?? profile?.image ?? "",
      bio: profile?.profile?.bio ?? "",
      website: profile?.profile?.website ?? "",
      twitter: profile?.profile?.twitter ?? "",
      github: profile?.profile?.github ?? "",
      linkedin: profile?.profile?.linkedin ?? "",
      location: profile?.profile?.location ?? "",
      skills: profile?.profile?.skills ?? [],
      experience: profile?.profile?.experience ?? "",
    },
  });
}

import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
  github: z.string().max(200).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  skills: z.array(z.string()).optional(),
  experience: z.string().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const user = await requireAuthAPI();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const { name, avatar, bio, website, twitter, github, linkedin, location, skills, experience } = parsed.data;

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { name, image: avatar },
    }),
    db.profile.upsert({
      where: { userId: user.id },
      update: { bio, website, twitter, github, linkedin, location, skills, experience },
      create: { userId: user.id, bio, website, twitter, github, linkedin, location, skills, experience },
    }),
  ]);

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
