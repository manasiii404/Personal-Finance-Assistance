import { PrismaClient } from '@prisma/client';

// Mock Prisma client for testing
jest.mock('@/config/database', () => ({
  __esModule: true,
  default: new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
      },
    },
  }),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Mock AI response',
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

// Global test timeout
jest.setTimeout(10000);
