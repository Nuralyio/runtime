# Multi-stage Dockerfile for NuralyUI Storybook
FROM node:latest AS base

WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/forms/package.json ./packages/forms/
COPY packages/layout/package.json ./packages/layout/
COPY packages/themes/package.json ./packages/themes/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project and all packages
RUN npm run build

# Development stage — runs Storybook dev server with hot reload
FROM base AS development
EXPOSE 6006
CMD ["npx", "storybook", "dev", "-p", "6006", "--host", "0.0.0.0", "--no-open"]

# Production build stage
FROM base AS build
ENV STORYBOOK_BASE=/ui/storybook/
RUN npx storybook build

# Production stage — serves static Storybook via nginx
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/storybook-static /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
