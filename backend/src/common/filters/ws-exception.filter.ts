import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    
    let message = 'Internal server error';
    let error = 'INTERNAL_ERROR';

    if (exception instanceof WsException) {
      message = exception.message;
      error = 'WS_ERROR';
    } else if (exception instanceof HttpException) {
      message = exception.message;
      error = 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = 'ERROR';
    }

    this.logger.error(
      `WebSocket error: ${error} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    client.emit('error', {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
