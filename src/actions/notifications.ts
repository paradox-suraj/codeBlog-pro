"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export async function getNotifications() {
  try {
    const user = await requireAuth();

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { userId: user.id, read: false },
    });

    return { success: true, notifications, unreadCount };
  } catch (error) {
    console.error("[GET_NOTIFICATIONS]", error);
    return { error: "Failed to fetch notifications", notifications: [], unreadCount: 0 };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const user = await requireAuth();

    await db.notification.update({
      where: {
        id: notificationId,
        userId: user.id, // Ensure ownership
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("[MARK_NOTIFICATION_READ]", error);
    return { error: "Failed to mark as read" };
  }
}

export async function markAllAsRead() {
  try {
    const user = await requireAuth();

    await db.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("[MARK_ALL_NOTIFICATIONS_READ]", error);
    return { error: "Failed to mark all as read" };
  }
}
