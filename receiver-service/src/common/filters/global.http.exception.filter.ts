import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ServiceConstants } from '../constants/service.constants';

@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  logger = new Logger(this.constructor.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.error(exception, exception.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;

    // skip response transformation for health check and ping
    if (
      ServiceConstants.response_interceptor_skip_routes.includes(
        request.originalUrl,
      )
    ) {
      response.status(status).send(exception);
    } else {
      response.status(status).json({
        error: {
          code: '',
          description: message,
          additionalInfo: [],
          statusCode: status,
          timestamp: new Date().toISOString(),
        },
        request: {
          url: request.originalUrl,
          method: request.method,
          params: request.params,
          query: request.query,
          body: request.body,
        },
      });
    }
  }
}
