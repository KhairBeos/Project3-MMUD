import { Controller, Get, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Endpoint Lấy lịch sử chat của một phòng
   * Ví dụ: GET /messages/6544d...f?page=1&limit=20
   */
  @UseGuards(JwtAuthGuard)
  @Get(':roomId')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('page') pageQuery: string,
    @Query('limit') limitQuery: string,
  ) {
    // (Kiểm tra xem user có trong phòng này không - TODO sau)
    // Hiện tại, JwtAuthGuard chỉ đảm bảo user đã đăng nhập.
    
    const page = parseInt(pageQuery, 10) || 1;
    const limit = parseInt(limitQuery, 10) || 30;

    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page và Limit phải là số dương.');
    }

    return this.messagesService.getMessagesForRoom(roomId, page, limit);
  }
}