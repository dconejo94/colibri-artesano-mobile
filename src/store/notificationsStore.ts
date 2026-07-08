/**
 * Unread notifications badge count — cache of GET /notifications/unread's
 * `total`, so Header/HamburgerMenu can show a badge without every screen
 * re-fetching. Screens that change read-state update this store directly
 * (decrement/zero) instead of forcing a refetch.
 */
import { create } from "zustand";
import { getUnreadNotifications } from "@/api/notifications";

interface NotificationsState {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrement: () => void;
  refresh: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  refresh: async () => {
    try {
      const res = await getUnreadNotifications(1, 1);
      set({ unreadCount: res.total });
    } catch {
      // Badge is best-effort — a failed refresh just leaves the last known count.
    }
  },
}));
