import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate token và trả về user sạch (không pass, không OTP)
   */
  async validate(payload: { sub: string; username: string }): Promise<AuthenticatedUser> {
    // 2. Định nghĩa kiểu trả về là Promise<AuthenticatedUser>

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token không hợp lệ hoặc người dùng không tồn tại.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt.');
    }

    // 3. Chuyển Mongoose Document sang Plain Object (POJO)
    const userObject = user.toObject() as User;

    // 4. Xóa các trường nhạy cảm
    delete userObject.password;
    delete userObject.verificationOtp;
    delete userObject.verificationOtpExpires;

    return userObject as AuthenticatedUser;
  }
}
