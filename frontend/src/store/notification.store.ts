import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface Notification {
  _id: string;
  userId: string;
  type: "message" | "mention" | "room_invite" | "friend_request" | "system";
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  priority: "low" | "normal" | "high";
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  isConnected: boolean;

  initSocket: (token: string, userId: string) => void;
  disconnectSocket: () => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  isConnected: false,

  initSocket: (token: string, userId: string) => {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notifications`, {
      auth: { token, userId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Notification socket connected");
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("Notification socket disconnected");
      set({ isConnected: false });
    });

    socket.on("new-notification", (notification: Notification) => {
      get().addNotification(notification);
    });

    socket.on("unread-notifications", (notifications: Notification[]) => {
      set({
        notifications: notifications,
        unreadCount: notifications.length,
      });
    });

    socket.on("notification-read", ({ notificationId }) => {
      get().markAsRead(notificationId);
    });

    socket.on("all-notifications-read", () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    });

    socket.on("notification-deleted", ({ notificationId }) => {
      get().deleteNotification(notificationId);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("mark-as-read", notificationId);
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    const { socket } = get();
    if (socket) {
      socket.emit("mark-all-as-read");
    }

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (notificationId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("delete-notification", notificationId);
    }

    set((state) => {
      const notification = state.notifications.find(
        (n) => n._id === notificationId
      );
      return {
        notifications: state.notifications.filter(
          (n) => n._id !== notificationId
        ),
        unreadCount:
          notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    });
  },

  fetchNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        set({ notifications: data.data });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        set({ unreadCount: data.data.count });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },
}));
