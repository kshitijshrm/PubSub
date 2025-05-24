export const ServiceConstants = {
  response_interceptor_skip_routes: [
    '/app/receiver-service/ping',
    '/app/receiver-service/health',
  ],
  cache_interceptor_skip_routes: [
    '/app/receiver-service/ping',
    '/app/receiver-service/health',
  ],
  userId_header: 'x-receiver-api-userid',
  cache_control_header: 'cache-control',
  health_check_timeout_default: 2000,
};
