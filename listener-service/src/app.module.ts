import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { GlobalCustomCacheInterceptor } from './common/interceptor/global.cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { ListenerModule } from './listener/listener.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        (process.env.f_stage ?? 'local') === 'local'
          ? '.env.local'
          : '.env.cloud',
      isGlobal: true,
    }),
    HealthModule,
    DatabaseModule,
    ListenerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalCustomCacheInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule { }
