import { Module } from '@nestjs/common';
import { ListenerService } from './listener.service';
import { DatabaseModule } from '../database/database.module';
import { RedisService } from '../shared/redis.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [ListenerService, RedisService],
})
export class ListenerModule { }
