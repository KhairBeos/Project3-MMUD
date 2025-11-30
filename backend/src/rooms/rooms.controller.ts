import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  Param, 
  Patch, 
  ForbiddenException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('rooms')
@UseGuards(JwtAuthGuard) 
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Endpoint Lấy tất cả phòng chat của user
   */
  @Get()
  async getMyRooms(@Request() req) {
    // req.user được trả về từ JwtStrategy
    const user = req.user as AuthenticatedUser;
    return this.roomsService.findRoomsForUser(user.id);
  }

  /**
   * Endpoint Tạo phòng chat mới (cả 1-1 và nhóm)
   */
  @Post()
  async createRoom(
    @Request() req, 
    @Body() createRoomDto: CreateRoomDto
  ) {
    const creator = req.user as AuthenticatedUser; // User đã xác thực
    const { participantIds, type, groupName } = createRoomDto;
    
    return this.roomsService.createRoom(
      creator, 
      participantIds, 
      type, 
      groupName
    );
  }

  /**
   * 3. Endpoint Cập nhật thông tin phòng (tên nhóm, avatar)
   */
  @Patch(':roomId') // Dùng HTTP PATCH cho việc cập nhật
  async updateRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const user = req.user as AuthenticatedUser;

    // 💡 Lưu ý: Hàm `updateRoomInfo` này chúng ta chưa tạo
    // Chúng ta sẽ cần tạo nó trong 'rooms.service.ts'
    const updatedRoom = await this.roomsService.updateRoomInfo(
      user.id, 
      roomId, 
      updateRoomDto
    );

    if (!updatedRoom) {
      throw new ForbiddenException('Bạn không có quyền cập nhật phòng này.');
    }
    
    return updatedRoom;
  }
}