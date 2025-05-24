# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy only necessary files
COPY package.json yarn.lock ./
COPY tsconfig*.json ./
COPY receiver-service/src ./src

# Install dependencies and build the app
RUN yarn install && yarn build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy built app and production dependencies
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production && yarn cache clean

EXPOSE 3001

CMD ["yarn", "start:receiver"]