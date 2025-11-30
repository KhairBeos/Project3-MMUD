import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Enum để phân biệt chat 1-1 hay chat nhóm
export enum RoomType {
  DIRECT = 'direct', // Chat 1-1
  GROUP = 'group', // Chat nhóm
}

@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({
    type: String,
    enum: RoomType,
    default: RoomType.DIRECT,
  })
  type!: RoomType;

  // Danh sách người tham gia
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants!: MongooseSchema.Types.ObjectId[];

  // Thông tin nhóm (chỉ dùng nếu type là 'group')
  @Prop({ trim: true })
  groupName?: string;

  @Prop()
  groupAvatar?: string;

  // Quản trị viên nhóm
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], // Tham chiếu 'User'
    default: [],
  })
  admins!: MongooseSchema.Types.ObjectId[];

  // Tin nhắn cuối cùng (để hiển thị preview)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Message', // Tham chiếu 'Message'
    default: null,
  })
  lastMessage?: MongooseSchema.Types.ObjectId;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Tối ưu: Giúp tìm kiếm các cuộc trò chuyện của 1 user nhanh hơn
RoomSchema.index({ participants: 1 });
