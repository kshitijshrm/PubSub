import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GetAllSubscriptionsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        return {
          data: instanceToPlain(data.subscriptions),
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
