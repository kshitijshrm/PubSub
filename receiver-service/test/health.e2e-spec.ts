import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { ServiceConstants } from '../src/common/constants/service.constants';
import { GlobalHttpExceptionFilter } from '../src/common/filters/global.http.exception.filter';
import { GlobalResponseTransformInterceptor } from '../src/common/interceptor/global.response.transformer.interceptor';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();

    // Set the MONGO_URI environment variable for the health check
    process.env.MONGO_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          // Load environment variables from test environment
          ignoreEnvFile: true,
          // Provide required environment variables
          load: [() => ({
            MONGO_URI: uri,
            // Add any other required environment variables here
          })],
        }),
        MongooseModule.forRoot(uri),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Set up the app with the same global filters and interceptors as in main.ts
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useGlobalInterceptors(new GlobalResponseTransformInterceptor());

    // Set the base path to match the main application
    const basePath = '/app/receiver-api';
    app.setGlobalPrefix(basePath);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoMemoryServer.stop();
  });

  it('/health (GET) should return health status', () => {
    return request(app.getHttpServer())
      .get('/app/receiver-api/health') // Use the full path with prefix
      .set(ServiceConstants.userId_header, 'test-user-id') // Add the user ID header
      .expect(200)
      .then((response) => {

        // Validate the top-level status
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('status', 'ok');

        // Validate the details object
        expect(response.body.data).toHaveProperty('details');
        expect(response.body.data.details).toHaveProperty('mongodb');
        expect(response.body.data.details.mongodb).toHaveProperty('status', 'up');
        expect(response.body.data.details).toHaveProperty('environmentVariables');
        expect(response.body.data.details.environmentVariables).toHaveProperty('status', 'up');

        // Validate the info object
        expect(response.body.data).toHaveProperty('info');
        expect(response.body.data.info).toHaveProperty('mongodb');
        expect(response.body.data.info.mongodb).toHaveProperty('status', 'up');
        expect(response.body.data.info).toHaveProperty('environmentVariables');
        expect(response.body.data.info.environmentVariables).toHaveProperty('status', 'up');

        // Ensure there is no error object
        expect(response.body.data).toHaveProperty('error');
        expect(response.body.data.error).toEqual({});

        // Validate the request object
        expect(response.body).toHaveProperty('request');
        expect(response.body.request).toHaveProperty('url', '/app/receiver-api/health');
        expect(response.body.request).toHaveProperty('method', 'GET');
        expect(response.body.request).toHaveProperty('params', {});
        expect(response.body.request).toHaveProperty('query', {});
      })
  });
});
