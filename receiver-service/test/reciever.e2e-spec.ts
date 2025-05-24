import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ServiceConstants } from '../src/common/constants/service.constants';

jest.setTimeout(30000); // Increase Jest timeout for e2e tests

describe('ReceiverService (e2e)', () => {
  let app: INestApplication;
  let mongoMemoryServer: MongoMemoryServer;
  let mongoConnection: Connection;

  const userId = 'test-user-id';
  const testUser = {
    "user": "Tinku Sharma", // string
    "class": "Comics", // string
    "age": 26, // integer
    "email": "harry@potter.com" // email
  };

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Get the MongoDB connection
    mongoConnection = moduleFixture.get(getConnectionToken());

    // Verify connection is working
    if (!mongoConnection || !mongoConnection.db) {
      throw new Error('MongoDB connection not established');
    }

    console.log('MongoDB connection established successfully');
  });

  afterAll(async () => {
    await app.close();
    await mongoMemoryServer.stop();
  });

  afterEach(async () => {
    // Clear the database between tests
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('POST /receiver', () => {
    it('should create a new user record and exclude extra fields', async () => {
      return request(app.getHttpServer())
        .post('/receiver')
        .set(ServiceConstants.userId_header, userId)
        .send(testUser)
        .expect(202)
        .then((response) => {
          const responseBody = response.body;

          expect(responseBody).toHaveProperty('id');
          expect(responseBody).toHaveProperty('statusCode', 202);
          expect(responseBody).toHaveProperty('message', 'Request has been accepted for processing.');

          // Check for no extra fields
          const allowedFields = ['id', 'statusCode', 'message'];
          const responseFields = Object.keys(responseBody);
          responseFields.forEach((field) => {
            expect(allowedFields).toContain(field);
          });
        })
    });
    it('should reject a request with extra fields', async () => {
      const invalidUser = {
        ...testUser,
        extraField: 'not allowed', // Add an extra field
      };

      return request(app.getHttpServer())
        .post('/receiver')
        .set(ServiceConstants.userId_header, userId)
        .send(invalidUser)
        .expect(400)
        .then((response) => {
          const responseBody = response.body;

          expect(responseBody).toHaveProperty('statusCode', 400);
          expect(responseBody).toHaveProperty('error', 'Bad Request');
          expect(responseBody.message).toContain("Field \"extraField\": property extraField should not exist");
        })
    });

    it('should reject a request with incorrect field types', async () => {
      const invalidUser = {
        user: 12345, // Invalid type: should be a string
        class: 'Comics',
        age: 'twenty-six', // Invalid type: should be an integer
        email: 'invalid-email', // Invalid email format
      };

      return request(app.getHttpServer())
        .post('/receiver')
        .set(ServiceConstants.userId_header, userId)
        .send(invalidUser)
        .expect(400)
        .then((response) => {
          const responseBody = response.body;

          expect(responseBody).toHaveProperty('statusCode', 400);
          expect(responseBody).toHaveProperty('error', 'Bad Request');

          const expectedMessages = [
            'The "user" field must be a string.',
            'The "age" field must be an integer.',
            'The "email" field must be a valid email address.',
          ];

          expect(responseBody.message).toEqual(expect.arrayContaining(expectedMessages));
        })
        ;
    });
  });
});