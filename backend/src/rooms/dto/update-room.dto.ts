import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  groupName?: string;

  @IsUrl()
  @IsOptional()
  groupAvatar?: string;
}
