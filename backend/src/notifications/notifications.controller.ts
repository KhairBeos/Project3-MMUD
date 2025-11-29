import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    const notifications = await this.notificationsService.findAll(
      user.id,
      limit || 50,
    );
    
    return {
      success: true,
      data: notifications,
    };
  }

  @Get('unread')
  async getUnreadNotifications(@CurrentUser() user: User) {
    const notifications = await this.notificationsService.getUnreadNotifications(
      user.id,
    );
    const count = await this.notificationsService.getUnreadCount(user.id);
    
    return {
      success: true,
      data: {
        notifications,
        count,
      },
    };
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    
    return {
      success: true,
      data: { count },
    };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    
    return {
      success: true,
      data: notification,
      message: 'Notification marked as read',
    };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.notificationsService.deleteNotification(id, user.id);
    
    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  @Delete('read/all')
  async deleteAllRead(@CurrentUser() user: User) {
    await this.notificationsService.deleteAllRead(user.id);
    
    return {
      success: true,
      message: 'All read notifications deleted',
    };
  }
}