import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  // Socket management
  async addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
  }

  async removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId).size > 0
    );
  }

  // Notification CRUD
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      createdAt: new Date(),
      read: false,
    });
    return notification.save();
  }

  async findAll(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId, read: false })
      .exec();
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } },
    );
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId, read: true });
  }

  async deleteOldNotifications(days = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: date },
      read: true,
    });

    return result.deletedCount;
  }

  // Notification types
  async createMessageNotification(
    userId: string,
    senderId: string,
    senderName: string,
    message: string,
    roomId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'message',
      title: 'New Message',
      message: `${senderName}: ${message}`,
      data: {
        senderId,
        senderName,
        roomId,
        messagePreview: message.substring(0, 100),
      },
      actionUrl: `/chat/${roomId}`,
    });
  }

  async createMentionNotification(
    userId: string,
    senderId: string,
    senderName: string,
    message: string,
    roomId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${senderName} mentioned you: ${message}`,
      data: {
        senderId,
        senderName,
        roomId,
        messagePreview: message.substring(0, 100),
      },
      actionUrl: `/chat/${roomId}`,
      priority: 'high',
    });
  }

  async createRoomInviteNotification(
    userId: string,
    inviterId: string,
    inviterName: string,
    roomId: string,
    roomName: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'room_invite',
      title: 'Room Invitation',
      message: `${inviterName} invited you to join ${roomName}`,
      data: {
        inviterId,
        inviterName,
        roomId,
        roomName,
      },
      actionUrl: `/chat/group/${roomId}`,
      priority: 'high',
    });
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'system',
      title,
      message,
      data,
      priority: 'high',
    });
  }
}
