import { ParsedTransaction, SMSParseRequest } from '@/types';
import logger from '@/utils/logger';

export class SMSService {
  // Parse SMS text to extract transaction details
  static async parseSMS(data: SMSParseRequest): Promise<ParsedTransaction> {
    try {
      const { smsText } = data;
      const smsLower = smsText.toLowerCase();
      
      // Extract amount
      const amountMatch = smsText.match(/\$?(\d+\.?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      if (amount === 0) {
        throw new Error('No valid amount found in SMS');
      }

      // Determine transaction type
      let type: 'income' | 'expense' = 'expense';
      if (smsLower.includes('credit') || smsLower.includes('deposit') || 
          smsLower.includes('salary') || smsLower.includes('received')) {
        type = 'income';
      }

      // Extract description and category
      let description = 'SMS Transaction';
      let category = 'Other';
      let source = 'SMS Parsing';
      let confidence = 0.5;

      // Food-related transactions
      if (smsLower.includes('grocery') || smsLower.includes('food') || 
          smsLower.includes('restaurant') || smsLower.includes('supermarket')) {
        category = 'Food';
        description = 'Food Purchase';
        confidence = 0.8;
      }
      // Transportation
      else if (smsLower.includes('gas') || smsLower.includes('fuel') || 
               smsLower.includes('uber') || smsLower.includes('taxi') ||
               smsLower.includes('parking') || smsLower.includes('toll')) {
        category = 'Transportation';
        description = 'Transportation Expense';
        confidence = 0.8;
      }
      // ATM/Cash
      else if (smsLower.includes('atm') || smsLower.includes('withdrawal') ||
               smsLower.includes('cash')) {
        category = 'Cash';
        description = 'ATM Withdrawal';
        confidence = 0.9;
      }
      // Salary/Income
      else if (smsLower.includes('salary') || smsLower.includes('payroll') ||
               smsLower.includes('wage')) {
        category = 'Salary';
        description = 'Salary Credit';
        type = 'income';
        confidence = 0.9;
      }
      // Bills
      else if (smsLower.includes('bill') || smsLower.includes('payment') ||
               smsLower.includes('subscription') || smsLower.includes('utility')) {
        category = 'Bills';
        description = 'Bill Payment';
        confidence = 0.7;
      }
      // Shopping
      else if (smsLower.includes('store') || smsLower.includes('shop') ||
               smsLower.includes('purchase') || smsLower.includes('retail')) {
        category = 'Shopping';
        description = 'Shopping Purchase';
        confidence = 0.6;
      }
      // Entertainment
      else if (smsLower.includes('movie') || smsLower.includes('cinema') ||
               smsLower.includes('entertainment') || smsLower.includes('streaming')) {
        category = 'Entertainment';
        description = 'Entertainment Expense';
        confidence = 0.7;
      }

      // Extract merchant name if possible
      const merchantMatch = smsText.match(/at\s+([A-Za-z\s]+)/i);
      if (merchantMatch) {
        description = `${description} at ${merchantMatch[1].trim()}`;
        confidence += 0.1;
      }

      // Extract date if present
      const dateMatch = smsText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      if (dateMatch) {
        confidence += 0.1;
      }

      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);

      const parsedTransaction: ParsedTransaction = {
        description,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category,
        type,
        source,
        confidence,
      };

      logger.info('SMS parsed successfully:', { 
        originalSMS: smsText.substring(0, 100),
        parsedTransaction,
        confidence 
      });

      return parsedTransaction;
    } catch (error) {
      logger.error('Error parsing SMS:', error);
      throw new Error('Failed to parse SMS text');
    }
  }

  // Validate SMS format
  static validateSMSFormat(smsText: string): boolean {
    // Basic validation - should contain amount and some transaction keywords
    const hasAmount = /\$?(\d+\.?\d*)/.test(smsText);
    const hasKeywords = /(debit|credit|withdrawal|deposit|payment|purchase|spent|received)/i.test(smsText);
    
    return hasAmount && hasKeywords;
  }

  // Get supported SMS patterns
  static getSupportedPatterns(): string[] {
    return [
      'Account debited by $X.XX for [merchant]',
      'Credit of $X.XX received from [source]',
      'ATM withdrawal of $X.XX at [location]',
      'Payment of $X.XX to [merchant]',
      'Salary credit of $X.XX',
      'Purchase at [merchant] for $X.XX',
    ];
  }
}
