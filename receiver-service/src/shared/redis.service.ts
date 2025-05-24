import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }

    getClient(): Redis {
        return this.client;
    }
}