# Use Node.js Alpine base image
FROM node:22-alpine AS ui-build

# Create app directory
WORKDIR /usr/src/app

# Copy only necessary files to install dependencies
COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for build)
# Use --force to handle platform-specific packages
RUN npm ci --legacy-peer-deps --force || npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Build args for env vars needed at build time
ARG DASHBOARD_APP_UUID
ARG DASHBOARD_PAGE_UUID
ARG HOME_APP_UUID
ARG HOME_PAGE_UUID

# Set env vars for build
ENV DASHBOARD_APP_UUID=$DASHBOARD_APP_UUID
ENV DASHBOARD_PAGE_UUID=$DASHBOARD_PAGE_UUID
ENV HOME_APP_UUID=$HOME_APP_UUID
ENV HOME_PAGE_UUID=$HOME_PAGE_UUID

# Build the project
RUN npm run build

# Use a minimal runtime image
FROM node:22-alpine AS runtime

WORKDIR /usr/src/app

# Copy only built files and node_modules
COPY --from=ui-build /usr/src/app/dist ./dist
COPY --from=ui-build /usr/src/app/node_modules ./node_modules
COPY --from=ui-build /usr/src/app/package.json ./package.json

EXPOSE 4321

CMD ["npm", "run", "server"]