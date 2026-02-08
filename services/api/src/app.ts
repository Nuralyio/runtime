import express from 'express';
import { createServer } from 'http';
import { RegisterRoutes } from '../build/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../build/swagger.json';
import { errorHandler } from './auth/middleware/error.handler';
import dotenv from 'dotenv';
import authMiddleware from './middlewares/user.middleware';
import { schema } from '../prisma/prisma';
import { createHandler } from 'graphql-http/lib/use/express';
import { PresenceGateway } from './presence';
import { WorkflowGateway } from './workflow';
import { getJournalClient } from './journal/journal.client';
var { ruruHTML } = require("ruru/server")

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize presence gateway (Socket.IO)
const presenceGateway = new PresenceGateway(httpServer);

// Initialize workflow gateway (Socket.IO + RabbitMQ)
const workflowGateway = new WorkflowGateway(httpServer);
workflowGateway.start().catch(err => {
  console.error('Failed to start workflow gateway:', err);
});

// Initialize journal client (RabbitMQ logging)
const journalClient = getJournalClient();
journalClient.connect().catch(err => {
  console.error('Failed to connect journal client:', err);
});

app.use(express.json());

app.use(authMiddleware);

RegisterRoutes(app);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/graphql', createHandler({
  schema: schema,
}));
app.get("/api/graphql-ide", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/api/graphql" }))
})
app.use(errorHandler);

httpServer.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.BACKEND_PORT}`);
  console.log(`Presence WebSocket available at /socket.io/presence`);
  console.log(`Workflow WebSocket available at /socket.io/workflow`);
});
