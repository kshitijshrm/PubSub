# Pub/Sub Service

A NestJS-based Pub/Sub system for managing message publishing and subscription. This project includes two main services: `receiver-service` and `listener-service`. The `receiver-service` handles incoming requests and publishes messages to a Redis stream, while the `listener-service` processes messages from the stream.

## Features

- **Receiver Service**:

  - Accepts user data and validates it.
  - Publishes messages to a Redis stream.
  - MongoDB integration for data persistence.

- **Listener Service**:

  - Consumes messages from the Redis stream.
  - Processes and stores data in MongoDB.
  - Ensures idempotency for message processing.

- **Health Checks**:

  - Built-in health endpoints for monitoring service and dependencies.

- **Swagger API Documentation**:
  - Interactive API documentation for `receiver-service`.

## Local Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)
- Redis (local instance or cloud-based)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd PubSub
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment files:

   For `receiver-service`, create a `.env` file in `receiver-service`:

   ```
   MONGO_URI=mongodb://localhost:27017/receiver-service
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3001
   ```

   For `listener-service`, create a `.env` file in `listener-service`:

   ```
   MONGO_URI=mongodb://localhost:27017/listener-service
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3002
   ```

### Running the Services

Start the `receiver-service`:

```bash
npm run start:receiver
```

Start the `listener-service`:

```bash
npm run start:listener
```

The `receiver-service` will be available at `http://localhost:3001`, and the `listener-service` will run in the background to process messages.

## API Documentation (Swagger)

The `receiver-service` comes with built-in Swagger documentation.

Access Swagger UI at:

- Local: `http://localhost:3001/api/docs`

Swagger features:

- Interactive API documentation
- Request/response schema examples
- Try-it-out functionality to test endpoints directly

## Testing

### Unit Tests

Run unit tests for both services:

```bash
npm test
```

### End-to-End Tests

Run e2e tests for `receiver-service`:

```bash
npm run test:e2e
```

### Test Coverage

Run tests with coverage:

```bash
npm run test:cov
```

## Deployment

Ensure the following environment variables are set in your deployment platform:

- `MONGO_URI`
- `REDIS_HOST`
- `REDIS_PORT`
- `PORT`

## Health Check

Both services include a health check endpoint to monitor the status of the application and its dependencies.

### Receiver Service Health Check

- **Endpoint**: `GET /health`
- **Description**: Returns the health status of the `receiver-service`.

### Listener Service Health Check

- **Endpoint**: `GET /health`
- **Description**: Returns the health status of the `listener-service`.

### Sample Curl for Receiver Service

```
curl --location 'http://localhost:3000/app/receiver-service/receiver' \
--header 'Content-Type: application/json' \
--header 'x-receiver-api-userId: user-1' \
--data-raw '{
    "user": "Harry",
    "class": "Comics",
    "age": 26,
    "email": "harry@potter.com"
}'
```

## License

[MIT](LICENSE)
