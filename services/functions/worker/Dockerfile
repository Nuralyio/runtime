FROM denoland/deno:alpine-2.1.4

WORKDIR /app

# Copy source
COPY deno.json ./
COPY src/ ./src/

# Cache dependencies
RUN deno cache src/main.ts

# Ensure deno user owns the cache directory for URL import resolution
RUN chown -R deno:deno /deno-dir

USER deno

CMD ["run", \
     "--allow-net", \
     "--allow-read=/tmp,/app,/deno-dir", \
     "--allow-write=/tmp,/deno-dir", \
     "--allow-run", \
     "--allow-env", \
     "src/main.ts"]
