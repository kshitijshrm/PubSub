import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { User, UserSchema } from './schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGO_URI')
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
    providers: [MongooseHealthIndicator],
    exports: [
        MongooseModule,
        MongooseHealthIndicator,
        // Export the registered schemas so they can be used in other modules
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
})
export class DatabaseModule { }
