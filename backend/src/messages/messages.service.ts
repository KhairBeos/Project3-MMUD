import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { RoomsService } from '../rooms/rooms.service'; 
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly roomsService: RoomsService, 
  ) {}

  /**
   * Tạo một tin nhắn mới
   */
  async createMessage(
    sender: AuthenticatedUser,
    roomId: string,
    content: string,
  ): Promise<Message> {

    // Kiểm tra xem phòng có tồn tại không
    const room = await this.roomsService.findRoomById(roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat.');
    }

    // Kiểm tra xem người gửi có phải là thành viên của phòng không
    const isParticipant = room.participants.some(
      (participantId) => participantId.toString() === sender.id,
    );
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong phòng này.');
    }

    // Tạo và lưu tin nhắn mới
    const newMessage = new this.messageModel({
      chat: roomId,
      sender: sender._id, // Lưu ObjectId của người gửi
      content: content,
      type: 'text', 
      readBy: [sender._id], 
    });

    const savedMessage = await newMessage.save();

    // Cập nhật 'lastMessage' trong Room
    await this.roomsService.setLastMessage(roomId, savedMessage._id as Types.ObjectId);

    // Populate thông tin người gửi trước khi trả về
    await savedMessage.populate('sender', 'username displayName avatarUrl');

    return savedMessage;
  }

  /**
   * Lấy lịch sử tin nhắn của một phòng (phân trang)
   */
  async getMessagesForRoom(
    roomId: string,
    page: number = 1,
    limit: number = 30, 
  ): Promise<Message[]> {
    
    const skip = (page - 1) * limit;

    return this.messageModel
      .find({ chat: roomId })
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(limit) 
      .populate('sender', 'username displayName avatarUrl') 
      .exec();
  }
}