import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ConfigModule,
    MongooseModule
  ],
  controllers: [HealthController]
})
export class HealthModule {}
