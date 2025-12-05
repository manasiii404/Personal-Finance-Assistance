import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { config } from './config/env';
import logger from './utils/logger';

let io: Server;

export const initializeWebSocket = (httpServer: HTTPServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.frontendUrl,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            (socket as any).userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        logger.info(`User connected: ${userId}`);

        // Join user's personal room for direct notifications
        socket.join(`user:${userId}`);

        // Join family room
        socket.on('family:join-room', (familyId: string) => {
            socket.join(`family:${familyId}`);
            logger.info(`User ${userId} joined family room: ${familyId}`);
        });

        // Leave family room
        socket.on('family:leave-room', (familyId: string) => {
            socket.leave(`family:${familyId}`);
            logger.info(`User ${userId} left family room: ${familyId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${userId}`);
        });
    });

    logger.info('WebSocket server initialized');
    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Family event emitters
export const emitFamilyEvent = (familyId: string, event: string, data: any) => {
    if (io) {
        io.to(`family:${familyId}`).emit(event, data);
    }
};

// Emit event to specific user
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Emit event to all members of a family
export const emitToFamily = (familyId: string, event: string, data: any) => {
    if (io) {
        io.to(`family:${familyId}`).emit(event, data);
    }
};
