import 'reflect-metadata';

// Mock Prisma client
jest.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    applicationVersion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    pageVersion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    componentVersion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    applicationRevision: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    publishedVersion: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    applications: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    pages: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    components: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
