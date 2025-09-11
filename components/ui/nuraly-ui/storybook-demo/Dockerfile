# Multi-stage build for Storybook
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy parent package files first
COPY package*.json ./
RUN npm ci

# Build the components
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY rollup.config.js ./rollup.config.js
COPY web-dev-server.config.js ./web-dev-server.config.js
COPY web-test-runner.config.js ./web-test-runner.config.js
RUN npm run build

# Now work on storybook
COPY storybook-demo/package*.json ./storybook-demo/
WORKDIR /app/storybook-demo
RUN npm ci

# Copy storybook source
COPY storybook-demo/.storybook ./.storybook
COPY storybook-demo/src ./src
COPY storybook-demo/tsconfig.json ./tsconfig.json

# Build storybook
RUN npm run build-storybook

# Production stage
FROM nginx:alpine

# Copy built storybook to nginx
COPY --from=builder /app/storybook-demo/storybook-static /usr/share/nginx/html

# Copy nginx configuration from the builder stage
COPY storybook-demo/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
