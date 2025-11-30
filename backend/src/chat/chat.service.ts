import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './schemas/room.schema';
import { Message } from './schemas/message.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createRoom(dto: CreateRoomDto) {
    const room = new this.roomModel(dto);
    return room.save();
  }

  async sendMessage(dto: SendMessageDto) {
    const message = new this.messageModel(dto);
    return message.save();
  }

  async getMessages(roomId: string) {
    return this.messageModel.find({ roomId }).sort({ createdAt: 1 }).exec();
  }

  async getRooms() {
    return this.roomModel.find().exec();
  }
}
