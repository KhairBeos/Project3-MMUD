import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// Định nghĩa kiểu mở rộng cho Socket ngay tại đây để ép kiểu an toàn
type SocketWithUser = Socket & { user: AuthenticatedUser };

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy socket client
    const client = context.switchToWs().getClient<SocketWithUser>();

    // 2. Lấy token từ handshake
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      this.logger.error('No token provided in WebSocket handshake.');
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      // 3. Giải mã token
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtSecret,
      });

      // 4. Tìm user trong DB
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new WsException('Unauthorized: User not found');
      }

      // 5. Gắn user vào socket
      // Lưu ý: Chúng ta gắn vào 'client.user' để khớp với interface AuthenticatedSocket trong Gateway
      // Không dùng 'client.data.user' để tránh phải sửa lại Gateway
      client.user = user.toObject() as AuthenticatedUser;

      this.logger.log(`WebSocket authenticated for user: ${payload.sub}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('WebSocket Authentication error:', errorMessage);
      throw new WsException(`Unauthorized: ${errorMessage}`);
    }
  }
}
