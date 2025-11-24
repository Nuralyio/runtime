# Nuralyio Documentation

This documentation site is built using [Docusaurus v3](https://docusaurus.io/), a modern static website generator.

## Installation

Install dependencies using npm:

```bash
npm install
```

## Local Development

Start the development server:

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

Build the static site:

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Docker Deployment

### Development Mode

Run with Docker in development mode with hot reload:

```bash
docker build -t nuraly-docs:dev -f Dockerfile.dev .
docker run -p 3001:3001 -v $(pwd):/app nuraly-docs:dev
```

Access at: http://localhost:3001

### Production Mode

Run with Docker in production mode on port 6009:

```bash
# Use the provided script (recommended)
./scripts/run-prod.sh

# Or manually
docker build -t nuraly-docs:prod .
docker run -d -p 6009:80 --name nuraly-docs-prod nuraly-docs:prod
```

Access at: http://localhost:6009

#### Production Scripts

- `./scripts/run-prod.sh` - Build and run the production container on port 6009
- `./scripts/stop-prod.sh` - Stop and remove the production container
- `./scripts/logs-prod.sh` - View production container logs

## Project Structure

```
.
├── blog/                   # Blog posts
├── docs/                   # Documentation files
├── src/                    # Custom React components and pages
├── static/                 # Static assets (images, files)
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js            # Sidebar navigation configuration
└── package.json           # Dependencies and scripts
```

## Contributing

Feel free to contribute to this documentation by submitting pull requests or opening issues.
