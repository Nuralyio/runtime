# Use the official Deno image.
# https://hub.docker.com/r/denoland/deno
FROM denoland/deno:alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the local code to the container image.
COPY . ./

# Allow Deno to cache dependencies in the build process

# Expose the port the app will run on
EXPOSE 8000

# Run the web service on container startup.
CMD ["deno", "run", "--unstable", "--allow-net=0.0.0.0:8080,api.github.com", "main.ts"]