import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  email!: string;

  @IsString({ message: 'Token không hợp lệ' })
  token!: string;

  @IsString()
  @Length(8, 255, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  newPassword!: string;
}
