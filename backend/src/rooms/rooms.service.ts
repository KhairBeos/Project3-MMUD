import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; 
import { Room, RoomType } from './schemas/room.schema'; 
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private readonly usersService: UsersService, 
  ) {}

  /**
   * Tạo phòng chat mới (cả 1-1 và nhóm)
   */
  async createRoom(
    creator: AuthenticatedUser, 
    participantIds: string[], 
    type: RoomType,
    groupName?: string,
  ): Promise<Room> {

    if (type === RoomType.DIRECT && participantIds.length !== 1) {
      throw new BadRequestException('Chat 1-1 chỉ được có 2 thành viên.');
    }
    if (type === RoomType.GROUP && !groupName) {
      throw new BadRequestException('Chat nhóm phải có tên nhóm.');
    }
    if (type === RoomType.DIRECT) {
      const existingRoom = await this.findDirectRoom(creator.id, participantIds[0]);
      if (existingRoom) {
        return existingRoom; 
      }
    }
    
    const allParticipantIds = [creator.id, ...participantIds];

    const newRoom = new this.roomModel({
      type,
      participants: allParticipantIds,
      groupName: type === RoomType.GROUP ? groupName : undefined,
      admins: type === RoomType.GROUP ? [creator.id] : undefined, 
    });

    const savedRoom = await newRoom.save();
    
    const roomId = savedRoom._id as Types.ObjectId; 

    // Cập nhật danh sách 'chats' cho TẤT CẢ thành viên
    const updatePromises = allParticipantIds.map(userId => 
      this.usersService.addChatToUser(userId, roomId)
    );
    await Promise.all(updatePromises);

    return savedRoom;
  }

  /**
   * (Helper) Tìm phòng 1-1 đã tồn tại giữa 2 user
   */
  async findDirectRoom(userId1: string, userId2: string): Promise<Room | null> {
    return this.roomModel.findOne({
      type: RoomType.DIRECT,
      participants: { 
        $all: [userId1, userId2], 
        $size: 2 
      }
    }).exec();
  }

  /**
   * Lấy tất cả các phòng của một user
   */
  async findRoomsForUser(userId: string): Promise<Room[]> {
    return this.roomModel.find({ 
      participants: userId 
    })
    .populate('participants', 'username displayName avatarUrl') 
    .populate('lastMessage') 
    .sort({ updatedAt: -1 }) 
    .exec();
  }

  /**
   * (Helper) Tìm phòng bằng ID
   */
  async findRoomById(roomId: string): Promise<Room | null> {
    return this.roomModel.findById(roomId).exec();
  }

  /**
   * (Helper) Cập nhật tin nhắn cuối cùng
   */
  async setLastMessage(roomId: string, messageId: Types.ObjectId): Promise<void> {
    await this.roomModel.updateOne(
      { _id: roomId },
      { $set: { lastMessage: messageId } }
    );
  }

  /**
   * Cập nhật thông tin phòng (chỉ admin của nhóm)
   */
  async updateRoomInfo(
    userId: string,
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room | null> {
    
    const updatedRoom = await this.roomModel.findOneAndUpdate(
      {
        _id: roomId,                
        type: RoomType.GROUP,       
        admins: userId,             
      },
      {
        $set: updateRoomDto,       
      },
      {
        new: true, 
      }
    ).exec();

    // 'updatedRoom' sẽ là 'null' nếu:
    // - Không tìm thấy phòng
    // - Hoặc đây không phải phòng nhóm
    // - Hoặc user không phải là admin
    // Controller sẽ xử lý việc ném lỗi 'ForbiddenException' nếu nhận về 'null'.
    return updatedRoom;
  }
}