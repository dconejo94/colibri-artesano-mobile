import client from "./client";
import type { PaginatedResponse } from "@/types/store";
import type { Notification } from "@/types/notification";

export async function getNotifications(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Notification>> {
  const { data } = await client.get<PaginatedResponse<Notification>>(
    "/api/v1/notifications",
    { params: { page, limit } }
  );
  return data;
}

export async function getUnreadNotifications(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Notification>> {
  const { data } = await client.get<PaginatedResponse<Notification>>(
    "/api/v1/notifications/unread",
    { params: { page, limit } }
  );
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await client.patch(`/api/v1/notifications/${notificationId}/read`);
}
