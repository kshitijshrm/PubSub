import { RedisConstants } from "./redis.constants";

export const ListenerConstants = {
  groupName: 'user-consumer-group',
  consumerName: `consumer-${process.pid}`,
  streamName: RedisConstants.streamName,
};

export const ServiceConstants = {
  response_interceptor_skip_routes: [
    '/app/listener-service/ping',
    '/app/listener-service/health',
  ],
  cache_interceptor_skip_routes: [
    '/app/listener-service/ping',
    '/app/listener-service/health',
  ],
  userId_header: 'x-listener-service-userid',
  cache_control_header: 'cache-control',
  health_check_timeout_default: 2000,
};