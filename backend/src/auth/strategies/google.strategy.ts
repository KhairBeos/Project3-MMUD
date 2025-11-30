import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Google OAuth Client ID hoặc Secret chưa được định nghĩa!');
    }

    super({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'], // Lấy email và profile
    });
  }

  /**
   * Google sẽ gọi hàm này sau khi xác thực thành công.
   * Nó trả về profile của user.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile as {
      id: string;
      name: { givenName: string; familyName: string };
      emails: Array<{ value: string }>;
      photos: Array<{ value: string }>;
    };

    if (!emails || !emails.length) {
      done(new UnauthorizedException('Không thể lấy email từ Google.'), false);
      return;
    }

    const googleProfile = {
      googleId: id,
      email: emails[0].value,
      displayName: `${name.givenName || ''} ${name.familyName || ''}`.trim(),
      avatarUrl: photos[0].value,
    };

    try {
      // 'user' ở đây sẽ có kiểu Omit<User, 'password'>
      const user = await this.authService.validateOAuthUser(googleProfile);

      // Chuyển 'user' (đã chuẩn) vào hàm done
      done(null, user);
    } catch (error) {
      // Bắt lỗi nếu validateOAuthUser ném ra (ví dụ: email đã dùng)
      done(error, false);
    }
  }
}
