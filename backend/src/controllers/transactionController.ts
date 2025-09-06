import { Request, Response } from 'express';
import { TransactionService } from '@/services/transactionService';
import { SMSService } from '@/services/smsService';
import { asyncHandler } from '@/middleware/errorHandler';
import { 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionFilters,
  SMSParseRequest 
} from '@/types';
import logger from '@/utils/logger';

export class TransactionController {
  // Create transaction
  static createTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: CreateTransactionRequest = req.body;
    
    const transaction = await TransactionService.createTransaction(userId, data);
    
    logger.info('Transaction created:', { transactionId: transaction.id, userId });
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  });

  // Get transactions with filters
  static getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const filters: TransactionFilters = req.query;
    
    const result = await TransactionService.getTransactions(userId, filters);
    
    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get transaction by ID
  static getTransactionById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const transaction = await TransactionService.getTransactionById(userId, id);
    
    res.json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
    });
  });

  // Update transaction
  static updateTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data: UpdateTransactionRequest = req.body;
    
    const transaction = await TransactionService.updateTransaction(userId, id, data);
    
    logger.info('Transaction updated:', { transactionId: id, userId });
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  });

  // Delete transaction
  static deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const result = await TransactionService.deleteTransaction(userId, id);
    
    logger.info('Transaction deleted:', { transactionId: id, userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get transaction statistics
  static getTransactionStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;
    
    const stats = await TransactionService.getTransactionStats(
      userId, 
      startDate as string, 
      endDate as string
    );
    
    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: stats,
    });
  });

  // Get spending by category
  static getSpendingByCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;
    
    const spending = await TransactionService.getSpendingByCategory(
      userId, 
      startDate as string, 
      endDate as string
    );
    
    res.json({
      success: true,
      message: 'Spending by category retrieved successfully',
      data: spending,
    });
  });

  // Parse SMS transaction
  static parseSMS = asyncHandler(async (req: Request, res: Response) => {
    const data: SMSParseRequest = req.body;
    
    // Validate SMS format
    if (!SMSService.validateSMSFormat(data.smsText)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SMS format. Please provide a valid bank SMS or transaction notification.',
      });
    }
    
    const parsedTransaction = await SMSService.parseSMS(data);
    
    logger.info('SMS parsed successfully:', { 
      confidence: parsedTransaction.confidence,
      type: parsedTransaction.type,
      amount: parsedTransaction.amount 
    });
    
    return res.json({
      success: true,
      message: 'SMS parsed successfully',
      data: parsedTransaction,
    });
  });

  // Create transaction from SMS
  static createFromSMS = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: SMSParseRequest = req.body;
    
    // Parse SMS
    const parsedTransaction = await SMSService.parseSMS(data);
    
    // Create transaction
    const transaction = await TransactionService.createTransaction(userId, {
      date: new Date().toISOString().split('T')[0],
      description: parsedTransaction.description,
      amount: parsedTransaction.amount,
      category: parsedTransaction.category,
      type: parsedTransaction.type,
      source: parsedTransaction.source,
    });
    
    logger.info('Transaction created from SMS:', { 
      transactionId: transaction.id, 
      userId,
      confidence: parsedTransaction.confidence 
    });
    
    res.status(201).json({
      success: true,
      message: 'Transaction created from SMS successfully',
      data: {
        transaction,
        confidence: parsedTransaction.confidence,
      },
    });
  });

  // Export transactions
  static exportTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { format = 'csv', startDate, endDate } = req.query;
    
    const result = await TransactionService.exportTransactions(
      userId, 
      format as 'csv' | 'json',
      { startDate: startDate as string, endDate: endDate as string }
    );
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      const csvContent = [
        result.headers?.join(',') || '',
        ...result.data.map(row => row.join(','))
      ].join('\n');
      
      res.send(csvContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.json(result.data);
    }
  });

  // Get supported SMS patterns
  static getSupportedSMSPatterns = asyncHandler(async (req: Request, res: Response) => {
    const patterns = SMSService.getSupportedPatterns();
    
    res.json({
      success: true,
      message: 'Supported SMS patterns retrieved successfully',
      data: patterns,
    });
  });
}
