import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(
      `[REQUEST] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`[REQUEST BODY] ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;

          this.logger.log(
            `[RESPONSE] ${method} ${url} - ${statusCode} - ${responseTime}ms`,
          );

          if (data) {
            this.logger.debug(`[RESPONSE DATA] ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[ERROR] ${method} ${url} - ${error.status || 500} - ${responseTime}ms - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
