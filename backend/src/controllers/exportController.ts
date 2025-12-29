import { Request, Response } from 'express';
import { ExportService } from '@/services/exportService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

export class ExportController {
    /**
     * Export user data
     * POST /api/export/data
     */
    static exportData = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { format, dataType, startDate, endDate, category, type } = req.body;

        if (!format || !dataType) {
            throw createError('Format and data type are required', 400);
        }

        if (!['csv', 'json'].includes(format)) {
            throw createError('Invalid format. Must be csv or json', 400);
        }

        if (!['transactions', 'budgets', 'goals', 'all'].includes(dataType)) {
            throw createError('Invalid data type', 400);
        }

        const result = await ExportService.exportData({
            userId,
            format,
            dataType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            category,
            type,
        });

        logger.info('Data exported:', { userId, format, dataType });

        // Set appropriate headers for file download
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.data);
    });

    /**
     * Get export preview/summary
     * POST /api/export/preview
     */
    static getExportPreview = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { dataType, startDate, endDate, category, type } = req.body;

        const summary = await ExportService.getExportSummary(userId, {
            dataType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            category,
            type,
        });

        res.json({
            success: true,
            message: 'Export preview generated',
            data: summary,
        });
    });
}
