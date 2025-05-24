// apps/receiver-service/src/receiver.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisConstants } from '../common/constants/redis.constants';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class ReceiverService {
  constructor(
    private readonly redisService: RedisService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async create(data: CreateUserDto): Promise<{ id: string; statusCode: number; message: string }> {
    const id = uuidv4();
    const inserted_at = new Date();

    const record = new this.userModel({
      ...data,
      id,
      inserted_at,
    });

    await record.save();

    await this.redisService.getClient().xadd(
      RedisConstants.streamName,
      '*',
      'data',
      JSON.stringify({
        id,
        ...data,
        inserted_at,
      }),
    );

    return {
      id,
      statusCode: 202,
      message: 'Request has been accepted for processing.',
    };
  }
}
