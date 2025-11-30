export type NotificationType =
  | "message"
  | "mention"
  | "room_invite"
  | "friend_request"
  | "system";
export type NotificationPriority = "low" | "normal" | "high";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    senderId?: string;
    senderName?: string;
    roomId?: string;
    roomName?: string;
    messagePreview?: string;
    [key: string]: any;
  };
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  priority: NotificationPriority;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}
