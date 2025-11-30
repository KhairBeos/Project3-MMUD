import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Guard này sẽ tự động kích hoạt 'google' strategy (GoogleStrategy) và chuyển hướng người dùng đến trang đăng nhập của Google.
}
