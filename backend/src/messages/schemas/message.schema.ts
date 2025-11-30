import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// (Tùy chọn) Enum cho loại tin nhắn
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system', // Tin nhắn hệ thống (VD: "A đã tham gia nhóm")
}

@Schema({ timestamps: true })
export class Message extends Document {
  // Cuộc trò chuyện mà tin nhắn này thuộc về
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Room', //Tham chiếu đến 'Room'
    required: true,
  })
  chat!: MongooseSchema.Types.ObjectId;

  // Người gửi tin nhắn
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User', // Tham chiếu 'User'
    required: true,
  })
  sender!: MongooseSchema.Types.ObjectId;

  // Nội dung tin nhắn
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  content!: string; // Có thể là text, hoặc URL nếu là ảnh/file

  @Prop({
    type: String,
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  // Danh sách người đã đọc tin nhắn này
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], // Tham chiếu 'User'
    default: [],
  })
  readBy!: MongooseSchema.Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Tối ưu: Giúp tải tất cả tin nhắn của 1 chat nhanh hơn
MessageSchema.index({ chat: 1 });
