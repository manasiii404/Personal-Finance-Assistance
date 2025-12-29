import { parse } from 'csv-parse/sync';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';
import { TransactionType } from '@prisma/client';

export interface ImportTransaction {
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    source: string;
}

export interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
    duplicates: number;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    preview: ImportTransaction[];
    totalRecords: number;
}

export class ImportService {
    /**
     * Validate imported data before processing
     */
    static async validateImportData(
        userId: string,
        data: string,
        format: 'csv' | 'json'
    ): Promise<ValidationResult> {
        try {
            const errors: string[] = [];
            const warnings: string[] = [];
            let records: any[] = [];

            // Parse data based on format
            if (format === 'csv') {
                try {
                    records = parse(data, {
                        columns: true,
                        skip_empty_lines: true,
                        trim: true,
                    });
                } catch (error) {
                    errors.push('Invalid CSV format. Please check your file.');
                    return { valid: false, errors, warnings, preview: [], totalRecords: 0 };
                }
            } else if (format === 'json') {
                try {
                    const parsed = JSON.parse(data);
                    records = Array.isArray(parsed) ? parsed : parsed.data || [];
                } catch (error) {
                    errors.push('Invalid JSON format. Please check your file.');
                    return { valid: false, errors, warnings, preview: [], totalRecords: 0 };
                }
            }

            if (records.length === 0) {
                errors.push('No records found in the file.');
                return { valid: false, errors, warnings, preview: [], totalRecords: 0 };
            }

            if (records.length > 1000) {
                warnings.push(`Large import detected (${records.length} records). This may take a while.`);
            }

            // Validate each record
            const validRecords: ImportTransaction[] = [];
            const requiredFields = ['date', 'description', 'amount', 'category', 'type', 'source'];

            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const rowNum = i + 2; // +2 because of 0-index and header row

                // Check required fields
                const missingFields = requiredFields.filter(field => !record[field]);
                if (missingFields.length > 0) {
                    errors.push(`Row ${rowNum}: Missing required fields: ${missingFields.join(', ')}`);
                    continue;
                }

                // Validate date
                const date = new Date(record.date);
                if (isNaN(date.getTime())) {
                    errors.push(`Row ${rowNum}: Invalid date format. Use YYYY-MM-DD.`);
                    continue;
                }

                // Validate amount
                const amount = parseFloat(record.amount);
                if (isNaN(amount) || amount <= 0) {
                    errors.push(`Row ${rowNum}: Invalid amount. Must be a positive number.`);
                    continue;
                }

                // Validate type
                const type = record.type.toUpperCase();
                if (type !== 'INCOME' && type !== 'EXPENSE') {
                    errors.push(`Row ${rowNum}: Invalid type. Must be 'INCOME' or 'EXPENSE'.`);
                    continue;
                }

                // Valid record
                validRecords.push({
                    date: record.date,
                    description: record.description.trim(),
                    amount,
                    category: record.category.trim(),
                    type: type as 'INCOME' | 'EXPENSE',
                    source: record.source.trim(),
                });
            }

            // Check for potential duplicates
            const duplicateCount = await this.checkDuplicates(userId, validRecords);
            if (duplicateCount > 0) {
                warnings.push(`${duplicateCount} potential duplicate(s) detected based on date, amount, and description.`);
            }

            return {
                valid: errors.length === 0,
                errors,
                warnings,
                preview: validRecords.slice(0, 10), // Preview first 10 records
                totalRecords: validRecords.length,
            };
        } catch (error) {
            logger.error('Import validation error:', error);
            throw createError('Failed to validate import data', 500);
        }
    }

    /**
     * Import transactions from validated data
     */
    static async importTransactions(
        userId: string,
        data: string,
        format: 'csv' | 'json',
        skipDuplicates: boolean = true
    ): Promise<ImportResult> {
        try {
            // First validate the data
            const validation = await this.validateImportData(userId, data, format);

            if (!validation.valid) {
                throw createError(`Validation failed: ${validation.errors.join(', ')}`, 400);
            }

            let records: any[] = [];

            // Parse data
            if (format === 'csv') {
                records = parse(data, {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                });
            } else {
                const parsed = JSON.parse(data);
                records = Array.isArray(parsed) ? parsed : parsed.data || [];
            }

            const result: ImportResult = {
                success: true,
                imported: 0,
                skipped: 0,
                errors: [],
                duplicates: 0,
            };

            // Import each transaction
            for (const record of records) {
                try {
                    const transactionData = {
                        date: new Date(record.date),
                        description: record.description.trim(),
                        amount: parseFloat(record.amount),
                        category: record.category.trim(),
                        type: record.type.toUpperCase() as TransactionType,
                        source: record.source.trim(),
                    };

                    // Check for duplicates if skipDuplicates is true
                    if (skipDuplicates) {
                        const isDuplicate = await this.isDuplicateTransaction(userId, transactionData);
                        if (isDuplicate) {
                            result.duplicates++;
                            result.skipped++;
                            continue;
                        }
                    }

                    // Create transaction
                    await prisma.transaction.create({
                        data: {
                            userId,
                            ...transactionData,
                        },
                    });

                    result.imported++;
                } catch (error: any) {
                    result.errors.push(`Failed to import: ${record.description} - ${error.message}`);
                    result.skipped++;
                }
            }

            logger.info('Import completed:', {
                userId,
                imported: result.imported,
                skipped: result.skipped,
                duplicates: result.duplicates,
            });

            return result;
        } catch (error) {
            logger.error('Import transactions error:', error);
            throw error;
        }
    }

    /**
     * Check for duplicate transactions
     */
    private static async checkDuplicates(
        userId: string,
        records: ImportTransaction[]
    ): Promise<number> {
        let duplicateCount = 0;

        for (const record of records) {
            const isDuplicate = await this.isDuplicateTransaction(userId, {
                date: new Date(record.date),
                description: record.description,
                amount: record.amount,
                category: record.category,
                type: record.type as TransactionType,
                source: record.source,
            });

            if (isDuplicate) {
                duplicateCount++;
            }
        }

        return duplicateCount;
    }

    /**
     * Check if a transaction is a duplicate
     */
    private static async isDuplicateTransaction(
        userId: string,
        transaction: {
            date: Date;
            description: string;
            amount: number;
            category: string;
            type: TransactionType;
            source: string;
        }
    ): Promise<boolean> {
        const existing = await prisma.transaction.findFirst({
            where: {
                userId,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
            },
        });

        return !!existing;
    }

    /**
     * Generate CSV template for import
     */
    static generateImportTemplate(): string {
        const headers = ['date', 'description', 'amount', 'category', 'type', 'source'];
        const exampleRow = [
            '2024-01-15',
            'Grocery Shopping',
            '150.50',
            'Food & Dining',
            'EXPENSE',
            'Manual Entry',
        ];

        return `${headers.join(',')}\n${exampleRow.join(',')}`;
    }

    /**
     * Get import statistics
     */
    static async getImportStats(userId: string): Promise<any> {
        const totalTransactions = await prisma.transaction.count({ where: { userId } });
        const manualTransactions = await prisma.transaction.count({
            where: { userId, source: 'Manual Entry' },
        });
        const importedTransactions = totalTransactions - manualTransactions;

        return {
            total: totalTransactions,
            manual: manualTransactions,
            imported: importedTransactions,
            importPercentage: totalTransactions > 0 ? ((importedTransactions / totalTransactions) * 100).toFixed(2) : 0,
        };
    }
}
