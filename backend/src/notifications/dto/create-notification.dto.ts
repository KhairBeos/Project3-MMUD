import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['message', 'mention', 'room_invite', 'friend_request', 'system'])
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsEnum(['low', 'normal', 'high'])
  @IsOptional()
  priority?: string;
}