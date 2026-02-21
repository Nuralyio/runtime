# Project Notes

## Build & Dev Environment

- All services run inside Docker containers with hot reload.
- **Do NOT run build, type-check, lint, or test commands on the host machine.** The containers handle compilation and hot reload automatically on file save.
- Use `docker-compose.dev.yml` for the dev environment.
