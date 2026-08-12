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
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuthAPI();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  const { name, avatar, bio, website, twitter, github, linkedin } = body;

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { name, image: avatar },
    }),
    db.profile.upsert({
      where: { userId: user.id },
      update: { bio, website, twitter, github, linkedin },
      create: { userId: user.id, bio, website, twitter, github, linkedin },
    }),
  ]);

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
