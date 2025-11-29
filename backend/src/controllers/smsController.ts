import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { TransactionService } from '@/services/transactionService';
import logger from '@/utils/logger';

export class SMSController {
    /**
     * Process incoming SMS from mobile app
     */
    static processSMS = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { smsText, sender } = req.body;

        logger.info(`SMS received from ${sender} for user ${userId}`);

        try {
            // Parse SMS to extract transaction details
            const parsedData = SMSController.parseBankSMS(smsText);

            if (!parsedData) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not parse SMS. Not a valid bank transaction SMS.',
                });
            }

            // Create transaction from parsed data
            const transaction = await TransactionService.createTransaction(userId, {
                amount: parsedData.amount,
                type: parsedData.type.toLowerCase() as 'income' | 'expense',
                category: parsedData.category || 'Other',
                description: parsedData.description,
                date: parsedData.date || new Date().toISOString(),
                source: 'sms',
            });

            logger.info(`Transaction created from SMS: ${transaction.id}`);

            res.json({
                success: true,
                message: 'SMS processed successfully',
                data: transaction,
            });
        } catch (error) {
            logger.error('Error processing SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process SMS',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    /**
     * Get SMS parsing history
     */
    static getHistory = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        const transactions = await TransactionService.getTransactions(userId, {
            page: 1,
            limit: 50,
        });

        res.json({
            success: true,
            data: transactions.data,
        });
    });

    /**
     * Parse bank SMS to extract transaction details
     */
    private static parseBankSMS(smsText: string): {
        amount: number;
        type: 'INCOME' | 'EXPENSE';
        category: string;
        description: string;
        date?: string;
    } | null {
        try {
            // Amount extraction
            const amountMatch = smsText.match(/(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
            if (!amountMatch) return null;

            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

            // Transaction type
            const isCredited = /credited|received|deposited/i.test(smsText);
            const isDebited = /debited|withdrawn|spent|paid/i.test(smsText);

            if (!isCredited && !isDebited) return null;

            const type: 'INCOME' | 'EXPENSE' = isCredited ? 'INCOME' : 'EXPENSE';

            // Category extraction
            let category = 'Other';

            if (type === 'EXPENSE') {
                if (/food|restaurant|dining|swiggy|zomato/i.test(smsText)) {
                    category = 'Food & Dining';
                } else if (/fuel|petrol|diesel|uber|ola|transport/i.test(smsText)) {
                    category = 'Transportation';
                } else if (/shopping|amazon|flipkart|myntra/i.test(smsText)) {
                    category = 'Shopping';
                } else if (/electricity|water|gas|bill|recharge/i.test(smsText)) {
                    category = 'Bills & Utilities';
                } else if (/movie|netflix|entertainment/i.test(smsText)) {
                    category = 'Entertainment';
                } else if (/hospital|medical|pharmacy|health/i.test(smsText)) {
                    category = 'Healthcare';
                }
            } else {
                if (/salary|sal/i.test(smsText)) {
                    category = 'Salary';
                } else if (/interest|dividend/i.test(smsText)) {
                    category = 'Investment';
                } else if (/refund|cashback/i.test(smsText)) {
                    category = 'Other';
                }
            }

            // Description
            const description = `Auto-imported from SMS: ${smsText.substring(0, 100)}`;

            return {
                amount,
                type,
                category,
                description,
            };
        } catch (error) {
            logger.error('Error parsing SMS:', error);
            return null;
        }
    }
}
