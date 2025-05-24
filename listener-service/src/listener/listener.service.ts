// apps/listener-service/src/listener.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '../shared/redis.service';
import { UserProcessed } from '../database/schemas/user-processed.schema';
import { ListenerConstants } from '../common/constants/service.constants';

@Injectable()
export class ListenerService implements OnModuleInit {
  private readonly logger = new Logger(ListenerService.name);
  private readonly groupName = ListenerConstants.groupName;
  private readonly consumerName = ListenerConstants.consumerName;
  private readonly stream = ListenerConstants.streamName;

  constructor(
    private readonly redisService: RedisService,
    @InjectModel(UserProcessed.name) private readonly userProcessedModel: Model<UserProcessed>,
  ) { }

  async onModuleInit() {
    const client = this.redisService.getClient();

    try {
      await client.xgroup('CREATE', this.stream, this.groupName, '0', 'MKSTREAM');
      this.logger.log(`Consumer group "${this.groupName}" created.`);
    } catch (error: any) {
      if (!error.message.includes('BUSYGROUP')) {
        this.logger.error('Error creating consumer group', error);
      } else {
        this.logger.log(`Consumer group "${this.groupName}" already exists.`);
      }
    }

    this.listenForMessages();
  }

  async listenForMessages() {
    const client = this.redisService.getClient();

    while (true) {
      try {
        const response = await client.xreadgroup(
          'GROUP',
          String(this.groupName),
          String(this.consumerName),
          'COUNT',
          10,
          'BLOCK',
          5000,
          'STREAMS',
          String(this.stream),
          '>',
        );
        if (!response) continue;

        for (const [streamName, messages] of response as [string, [string, string[]][]][]) {
          for (const [id, fields] of messages) {
            try {
              const dataIndex = fields.indexOf('data');
              if (dataIndex === -1) {
                this.logger.warn(`Message ${id} missing 'data' field`);
                await client.xack(this.stream, this.groupName, id);
                continue;
              }

              const jsonData = JSON.parse(fields[dataIndex + 1]);

              // Idempotency check
              const isProcessed = await client.sismember(`${this.stream}:processed_ids`, jsonData.id);
              if (isProcessed) {
                this.logger.log(`Skipping duplicate message with id ${jsonData.id}`);
                await client.xack(this.stream, this.groupName, id);
                continue;
              }

              jsonData.modified_at = new Date();

              await this.userProcessedModel.updateOne(
                { id: jsonData.id },
                {
                  $set: {
                    user: jsonData.user,
                    class: jsonData.class,
                    age: jsonData.age,
                    email: jsonData.email,
                    inserted_at: new Date(jsonData.inserted_at),
                    modified_at: new Date(jsonData.modified_at),
                  },
                },
                { upsert: true },
              );

              await client.sadd(`${this.stream}:processed_ids`, jsonData.id);
              await client.xack(this.stream, this.groupName, id);

              this.logger.log(`Processed and saved message ${id} for user id ${jsonData.id} of stream ${streamName}`);
            } catch (innerErr) {
              this.logger.error(`Error processing message ${id}`, innerErr);
            }
          }
        }
      } catch (err) {
        this.logger.error('Error reading from stream', err);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
}
