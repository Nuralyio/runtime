import express from 'express';
import { RegisterRoutes } from '../build/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../build/swagger.json';
import { errorHandler } from './auth/middleware/error.handler';
import dotenv from 'dotenv';
import authMiddleware from './middlewares/user.middleware';
import { schema } from '../prisma/prisma';
import { createHandler } from 'graphql-http/lib/use/express';
var { ruruHTML } = require("ruru/server")

dotenv.config(); 

const app = express();

app.use(express.json());

app.use(authMiddleware);

RegisterRoutes(app);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/graphql',   createHandler({
  schema: schema,
}));
app.get("/api/graphql-ide", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/api/graphql" }))
})
app.use(errorHandler);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.BACKEND_PORT}`);
});
