import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn', 'info'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  });

export default prisma;
