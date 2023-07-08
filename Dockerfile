# Stage 1: Install Dependencies
FROM node:lts-alpine as dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Stage 2: Build TypeScript and Generate Prisma Client
FROM dependencies as builder
WORKDIR /usr/src/app
COPY . .
RUN ls /usr/src/app/src
RUN npx prisma generate
RUN npm run build

# Stage 3: Final Image
FROM node:lts-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY .env .   

# Install production dependencies
# RUN npm ci --only=production

EXPOSE 3000

# Development configuration
CMD ["npm", "run", "docker:run-dev"]
