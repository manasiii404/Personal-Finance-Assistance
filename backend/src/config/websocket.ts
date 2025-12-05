import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './env';
import logger from '@/utils/logger';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: config.frontendUrl,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            socket.data.userId = decoded.userId;

            logger.info(`WebSocket authenticated: User ${decoded.userId}`);
            next();
        } catch (error) {
            logger.error('WebSocket authentication failed:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        logger.info(`WebSocket connected: ${socket.id} (User: ${userId})`);

        // Join user's personal room
        socket.join(`user:${userId}`);

        // Handle joining family room
        socket.on('join-family-room', (familyId: string) => {
            socket.join(`family:${familyId}`);
            logger.info(`User ${userId} joined family room: ${familyId}`);
        });

        // Handle leaving family room
        socket.on('leave-family-room', (familyId: string) => {
            socket.leave(`family:${familyId}`);
            logger.info(`User ${userId} left family room: ${familyId}`);
        });

        // Disconnection handler
        socket.on('disconnect', () => {
            logger.info(`WebSocket disconnected: ${socket.id} (User: ${userId})`);
        });
    });

    logger.info('WebSocket server initialized');
    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
    }
    return io;
};

// Helper functions to emit events
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

export const emitToFamily = (familyId: string, event: string, data: any) => {
    if (io) {
        io.to(`family:${familyId}`).emit(event, data);
    }
};

export default { initializeWebSocket, getIO, emitToUser, emitToFamily };
