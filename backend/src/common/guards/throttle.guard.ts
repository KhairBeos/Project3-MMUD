import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly limit: number;
  private readonly ttl: number; // time to live in milliseconds

  constructor(limit: number = 10, ttl: number = 60000) {
    this.limit = limit;
    this.ttl = ttl;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    const now = Date.now();

    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.ttl,
      });
      return true;
    }

    if (record.count >= this.limit) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  private getKey(request: any): string {
    // Use IP address or user ID as key
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id;
    return userId || ip;
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}
