import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errors: string[] | undefined;

    if (typeof exceptionResponse === 'object') {
      const response = exceptionResponse as any;
      message = response.message || exception.message;
      errors = Array.isArray(response.message) ? response.message : undefined;
    }

    this.logger.warn(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errors,
    };

    response.status(status).json(errorResponse);
  }
}
