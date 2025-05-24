import { Module } from '@nestjs/common';
import { ReceiverController } from './receiver.controller';
import { ReceiverService } from './receiver.service';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../shared/shared.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule
  ],
  controllers: [ReceiverController],
  providers: [ReceiverService],
  exports: [ReceiverService]
})
export class ReceiverModule { }
