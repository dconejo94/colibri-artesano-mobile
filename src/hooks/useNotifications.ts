import { useState, useEffect, useCallback } from "react";
import { getNotifications, markNotificationRead } from "@/api/notifications";
import { useNotificationsStore } from "@/src/store/notificationsStore";
import type { Notification } from "@/types/notification";
import { normalizeError, type ApiError } from "@/src/api/errors";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const refreshUnreadCount = useNotificationsStore((s) => s.refresh);
  const decrementUnread = useNotificationsStore((s) => s.decrement);

  const fetchNotifications = useCallback(async (targetPage = 1, append = false) => {
    if (targetPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    try {
      const res = await getNotifications(targetPage, 20);
      setNotifications((prev) => (append ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
      setPage(targetPage);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
    refreshUnreadCount();
  }, [fetchNotifications, refreshUnreadCount]);

  const fetchNextPage = () => {
    if (!isLoadingMore && notifications.length < total) fetchNotifications(page + 1, true);
  };

  const markRead = async (notification: Notification) => {
    if (notification.is_read) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );
    decrementUnread();
    try {
      await markNotificationRead(notification.id);
    } catch {
      // Best-effort — a failed mark-as-read just leaves it read locally
      // until the next fetch reconciles with the server.
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    useNotificationsStore.getState().setUnreadCount(0);
    await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => {})));
  };

  return {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore: notifications.length < total,
    fetchNextPage,
    refetch: () => fetchNotifications(1),
    markRead,
    markAllRead,
  };
}
