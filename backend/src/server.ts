import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from '@/config/env';
import { generalLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { initializeWebSocket } from './websocket';
import logger from '@/utils/logger';

// Import routes
import authRoutes from '@/routes/auth';
import transactionRoutes from '@/routes/transactions';
import budgetRoutes from '@/routes/budgets';
import goalRoutes from '@/routes/goals';
import alertRoutes from '@/routes/alerts';
import analyticsRoutes from '@/routes/analytics';
import mlRoutes from '@/routes/ml';
import smsRoutes from '@/routes/sms';
import familyRoutes from '@/routes/family';
import aiInsightsRoutes from '@/routes/aiInsights';
import notificationRoutes from '@/routes/notifications';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Personal Finance Management API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`WebSocket server initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
