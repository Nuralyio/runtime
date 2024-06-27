
```markdown
# Description
This project holds the gateway of Nuraly.

```bash
docker compose pull
```
must be executed before any `docker compose up` to get the latest docker images.

## Frontend Environment:

Running the environment with only the frontend ejected:
```bash
docker compose -f docker-compose-dev-frontend.yml up
```

### Backend Development:

Running the environment with only the backend ejected:
```bash
docker compose -f docker-compose-dev-backend.yml up
```

### Full Development Environment: