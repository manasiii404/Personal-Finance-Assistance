import { Request, Response } from 'express';
import { ImportService } from '@/services/importService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

export class ImportController {
    /**
     * Validate import data
     * POST /api/import/validate
     */
    static validateImport = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { data, format } = req.body;

        if (!data || !format) {
            throw createError('Data and format are required', 400);
        }

        if (!['csv', 'json'].includes(format)) {
            throw createError('Invalid format. Must be csv or json', 400);
        }

        const validation = await ImportService.validateImportData(userId, data, format);

        res.json({
            success: true,
            message: validation.valid ? 'Data is valid for import' : 'Validation failed',
            data: validation,
        });
    });

    /**
     * Import transactions
     * POST /api/import/transactions
     */
    static importTransactions = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { data, format, skipDuplicates = true } = req.body;

        if (!data || !format) {
            throw createError('Data and format are required', 400);
        }

        if (!['csv', 'json'].includes(format)) {
            throw createError('Invalid format. Must be csv or json', 400);
        }

        const result = await ImportService.importTransactions(userId, data, format, skipDuplicates);

        logger.info('Transactions imported:', {
            userId,
            imported: result.imported,
            skipped: result.skipped,
        });

        res.json({
            success: true,
            message: `Successfully imported ${result.imported} transaction(s)`,
            data: result,
        });
    });

    /**
     * Get import template
     * GET /api/import/template
     */
    static getImportTemplate = asyncHandler(async (req: Request, res: Response) => {
        const template = ImportService.generateImportTemplate();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"');
        res.send(template);
    });

    /**
     * Get import statistics
     * GET /api/import/stats
     */
    static getImportStats = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        const stats = await ImportService.getImportStats(userId);

        res.json({
            success: true,
            message: 'Import statistics retrieved',
            data: stats,
        });
    });
}
