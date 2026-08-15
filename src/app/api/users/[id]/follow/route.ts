import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthAPI();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.id;
    if (user.id === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create follow relationship
    await db.follows.create({
      data: {
        followerId: user.id,
        followingId: targetUserId,
      },
    });

    // Trigger Notification
    await db.notification.create({
      data: {
        userId: targetUserId,
        type: "FOLLOW",
        message: `${user.name || 'Someone'} started following you`,
        link: `/authors/${user.id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Unique constraint failed means they already follow
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true });
    }
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthAPI();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.id;

    await db.follows.deleteMany({
      where: {
        followerId: user.id,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
