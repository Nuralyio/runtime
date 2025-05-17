# Use Node.js Alpine base image
FROM node:22-alpine AS ui-build

# Install dependencies needed to build native modules (optional)
# Only needed if your dependencies require compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && python3 -m ensurepip \
    && pip3 install --no-cache --upgrade pip setuptools

# Create app directory
WORKDIR /usr/src/app

# Copy only necessary files to install dependencies
COPY package.json package-lock.json ./

# Install only production dependencies in final stage
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

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