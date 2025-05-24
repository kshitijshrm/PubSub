import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ServiceConstants } from '../constants/service.constants';

@Injectable()
export class GlobalResponseTransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // skip response transformation for health check and ping
    if (
      ServiceConstants.response_interceptor_skip_routes.findIndex((routeRe) =>
        new RegExp(routeRe).test(request.originalUrl),
      ) !== -1
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return {
          data: instanceToPlain(data),
          request: {
            url: request.originalUrl,
            method: request.method,
            params: request.params,
            query: request.query,
            body: request.body,
          },
        };
      }),
    );
  }
}
