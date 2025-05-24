import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { parse } from 'cache-control-parser';
import { ServiceConstants } from '../constants/service.constants';

@Injectable()
export class GlobalCustomCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GlobalCustomCacheInterceptor.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
  ) { }

  trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const httpAdapter = this.httpAdapterHost.httpAdapter;

    const method = httpAdapter.getRequestMethod(request);
    const url = httpAdapter.getRequestUrl(request);
    const userId = request.userId || 'anonymous';

    return `${userId}:${method}:${url}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const request = context.switchToHttp().getRequest();
    const url = request.originalUrl;

    // Skip authentication for health check and ping endpoints
    if (ServiceConstants.cache_interceptor_skip_routes.some(route =>
      new RegExp(route).test(url))) {
      this.logger.log(`Skipping auth for route: ${url}`);
      return next.handle();
    }

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';

    if (
      !isGetRequest ||
      (isGetRequest &&
        ServiceConstants.cache_interceptor_skip_routes.find((routeRe) =>
          new RegExp(routeRe).test(request.originalUrl),
        ))
    ) {
      return next.handle();
    }

    let serveCachedResponse = true;
    const cacheControlHeader = request.headers[
      ServiceConstants.cache_control_header
    ] as string;
    if (cacheControlHeader) {
      const cacheControlDirectives = parse(cacheControlHeader);
      if (
        cacheControlDirectives['no-cache'] ||
        cacheControlDirectives['no-store']
      ) {
        serveCachedResponse = false;
      }
    }
    if (!serveCachedResponse) {
      return next.handle();
    }

    return next.handle()
  }
}
