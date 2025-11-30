import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('room')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(dto);
  }

  @Post('message')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Get('messages')
  getMessages(@Query('roomId') roomId: string) {
    return this.chatService.getMessages(roomId);
  }

  @Get('rooms')
  getRooms() {
    return this.chatService.getRooms();
  }
}
