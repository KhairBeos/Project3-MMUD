import { IsNotEmpty, IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { RoomType } from '../schemas/room.schema';

export class CreateRoomDto {
  @IsArray()
  @IsNotEmpty()
  participantIds!: string[];

  @IsEnum(RoomType)
  @IsNotEmpty()
  type!: RoomType;

  @IsString()
  @IsOptional()
  groupName?: string;
}
