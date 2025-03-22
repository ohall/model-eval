FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy all packages
COPY packages ./packages

# Install dependencies
RUN pnpm install

# Build stage
FROM base AS builder

# Build packages
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built artifacts and node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/client/node_modules ./packages/client/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy package.json files
COPY package.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/

# Expose the server port
EXPOSE 8000

# Set the command to run the server
CMD ["node", "packages/server/dist/index.js"]