import { Strategy, IStrategyOptionsWithRequest } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { User } from '../../users/schemas/user.schema';
import { LoginRequestBody } from '../interfaces/login-request.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginIdentifier',
      passwordField: 'password',
      passReqToCallback: true,
    } as IStrategyOptionsWithRequest);
  }

  async validate(
    req: Request,
    loginIdentifier: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const body = (req.body || {}) as LoginRequestBody;

    // Ưu tiên loginIdentifier từ passport, nếu không có thì tìm trong body (email hoặc username)
    const identifier = loginIdentifier || body.loginIdentifier || body.email || body.username;

    if (!identifier) {
      throw new UnauthorizedException('Thiếu thông tin đăng nhập (email hoặc username)');
    }

    const user = await this.authService.validateUser(identifier, password);

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    return user;
  }
}
