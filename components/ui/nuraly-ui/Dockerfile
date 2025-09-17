# Multi-stage Dockerfile for hybrid-ui Storybook
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/themes/package.json ./packages/themes/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project and themes
RUN npm run build

# Development stage
FROM base AS development
EXPOSE 6006
CMD ["npm", "run", "storybook"]

# Production build stage
FROM base AS build
RUN npm run build-storybook

# Production stage with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built storybook from build stage
COPY --from=build /app/storybook-static /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]