import { UseGuards, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

export interface AuthenticatedSocket extends Socket {
  user: AuthenticatedUser;
}

@UseGuards(WsJwtGuard) // Bảo vệ toàn bộ Gateway
@WebSocketGateway({
  cors: { origin: '*' }, // Cho phép client kết nối
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  /**
   * XỬ LÝ KẾT NỐI
   */
  async handleConnection(@ConnectedSocket() socket: AuthenticatedSocket) {
    const user = socket.user;
    this.logger.log(`Client connected: ${user.username} (Socket ID: ${socket.id})`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await this.usersService.updateUserStatus((user as any).id, true);
    } catch (error) {
      this.logger.error('Error updating user status (connect)', error);
    }

    // Cho user tham gia phòng chat bằng ID của chính họ (để nhận thông báo)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-member-access
    socket.join((user as any).id);

    // (Tùy chọn) Cho user tham gia tất cả các phòng chat họ đang có
    // user.chats.forEach(chatId => socket.join(chatId.toString()));
  }

  /**
   * XỬ LÝ NGẮT KẾT NỐI (Giữ nguyên)
   */
  async handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    const user = socket.user;
    if (!user) return;

    this.logger.log(`Client disconnected: ${user.username} (Socket ID: ${socket.id})`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await this.usersService.updateUserStatus((user as any).id, false, new Date());
    } catch (error) {
      this.logger.error('Error updating user status (disconnect)', error);
    }
  }

  /**
   * XỬ LÝ GỬI TIN NHẮN
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; content: string },
  ): Promise<void> {
    const user = socket.user;
    const { roomId, content } = payload;

    if (!roomId || !content) {
      throw new WsException('Thiếu roomId hoặc content.');
    }

    try {
      // Lưu tin nhắn vào DB
      // Hàm này đã bao gồm: kiểm tra quyền, tạo tin nhắn, cập nhật lastMessage
      const newMessage = await this.messagesService.createMessage(user, roomId, content);

      // Phát tin nhắn (đã có _id, sender, createdAt) đến TẤT CẢ mọi người trong phòng chat đó.
      this.server.to(roomId).emit('newMessage', newMessage);
    } catch (error) {
      // Gửi lỗi về cho client nếu có (ví dụ: không có quyền, phòng không tồn tại)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending message: ${errorMessage}`);
      // Gửi lỗi về cho client
      socket.emit('error', new WsException(errorMessage));
    }
  }

  /**
   * Xử lý khi user tham gia phòng chat
   * Cần thiết để this.server.to(roomId) hoạt động
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.log(`${(socket.user as any).username} joined room: ${payload.roomId}`);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    socket.join(payload.roomId);
  }

  /**
   * Xử lý khi user rời phòng chat
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.log(`${(socket.user as any).username} left room: ${payload.roomId}`);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    socket.leave(payload.roomId);
  }
}
