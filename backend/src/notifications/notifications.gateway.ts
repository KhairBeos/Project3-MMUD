import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsCurrentUser } from '../common/decorators/ws-current-user.decorator';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      
      if (!userId) {
        this.logger.warn(`Client ${client.id} connected without userId`);
        client.disconnect();
        return;
      }

      await this.notificationsService.addUserSocket(userId, client.id);
      client.join(`user:${userId}`);
      
      this.logger.log(`Client ${client.id} connected - User: ${userId}`);

      // Gửi các thông báo chưa đọc
      const unreadNotifications = await this.notificationsService.getUnreadNotifications(userId);
      client.emit('unread-notifications', unreadNotifications);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    
    if (userId) {
      await this.notificationsService.removeUserSocket(userId, client.id);
      this.logger.log(`Client ${client.id} disconnected - User: ${userId}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() notificationId: string,
    @WsCurrentUser() user: User,
  ) {
    try {
      await this.notificationsService.markAsRead(notificationId, user.id);
      client.emit('notification-read', { notificationId });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: User,
  ) {
    try {
      await this.notificationsService.markAllAsRead(user.id);
      client.emit('all-notifications-read');
    } catch (error) {
      client.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('delete-notification')
  async handleDeleteNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() notificationId: string,
    @WsCurrentUser() user: User,
  ) {
    try {
      await this.notificationsService.deleteNotification(notificationId, user.id);
      client.emit('notification-deleted', { notificationId });
    } catch (error) {
      client.emit('error', { message: 'Failed to delete notification' });
    }
  }

  // Method để gửi thông báo đến user cụ thể
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
  }

  // Method để gửi thông báo đến nhiều users
  async sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('new-notification', notification);
    });
  }

  // Method để broadcast thông báo hệ thống
  async broadcastSystemNotification(notification: any) {
    this.server.emit('system-notification', notification);
  }
}