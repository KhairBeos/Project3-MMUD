import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard dùng để bảo vệ các route yêu cầu xác thực JWT. Nó sẽ tự động kích hoạt JwtStrategy của bạn để xác minh token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
