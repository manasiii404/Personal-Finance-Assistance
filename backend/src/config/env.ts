import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Email
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // Google Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aiInsightsEnabled: process.env.AI_INSIGHTS_ENABLED === 'true' || false,

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute (changed from 15 minutes)
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests (changed from 100)
  },

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
