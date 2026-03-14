# Stage 1: Build the React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the Express server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built server files
COPY --from=server-builder /app/server/dist ./server/dist

# Copy built client files
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure the SQLite data directory exists
RUN mkdir -p ./server/data

# Expose the server port
EXPOSE 3001

# Start the server (which will serve the client static files)
CMD ["node", "server/dist/index.js"]
