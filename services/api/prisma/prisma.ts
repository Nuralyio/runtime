import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const typeDefs = `
 type Application {
    uuid: String!
    name: String
  }

  type Query {
    allApplications: [Application!]!
  }
`;

const resolvers = {
  Query: {
    allApplications: () => {
      return prisma.applications.findMany();
    }
  }
};

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});



export default prisma;
