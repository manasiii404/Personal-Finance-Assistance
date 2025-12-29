/**
 * Transaction Categorizer
 * Rule-based categorization with ML model support
 */

export interface CategoryPrediction {
    category: string;
    confidence: number;
    alternatives?: Array<{ category: string; confidence: number }>;
}

export const CATEGORIES = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Groceries',
    'Travel',
    'Transfer',
    'Others'
] as const;

export type Category = typeof CATEGORIES[number];

class TransactionCategorizer {
    // Merchant to category mapping (rule-based)
    private merchantRules: Map<string, Category> = new Map([
        // Food & Dining
        ['SWIGGY', 'Food & Dining'],
        ['ZOMATO', 'Food & Dining'],
        ['DOMINOS', 'Food & Dining'],
        ['MCDONALDS', 'Food & Dining'],
        ['KFC', 'Food & Dining'],
        ['SUBWAY', 'Food & Dining'],
        ['STARBUCKS', 'Food & Dining'],
        ['CAFE', 'Food & Dining'],
        ['RESTAURANT', 'Food & Dining'],

        // Shopping
        ['AMAZON', 'Shopping'],
        ['FLIPKART', 'Shopping'],
        ['MYNTRA', 'Shopping'],
        ['AJIO', 'Shopping'],
        ['MEESHO', 'Shopping'],
        ['SNAPDEAL', 'Shopping'],

        // Transportation
        ['UBER', 'Transportation'],
        ['OLA', 'Transportation'],
        ['RAPIDO', 'Transportation'],
        ['METRO', 'Transportation'],
        ['PETROL', 'Transportation'],
        ['FUEL', 'Transportation'],

        // Bills & Utilities
        ['ELECTRICITY', 'Bills & Utilities'],
        ['WATER', 'Bills & Utilities'],
        ['GAS', 'Bills & Utilities'],
        ['BROADBAND', 'Bills & Utilities'],
        ['AIRTEL', 'Bills & Utilities'],
        ['JIO', 'Bills & Utilities'],
        ['VI', 'Bills & Utilities'],

        // Entertainment
        ['NETFLIX', 'Entertainment'],
        ['PRIME', 'Entertainment'],
        ['HOTSTAR', 'Entertainment'],
        ['SPOTIFY', 'Entertainment'],
        ['BOOKMYSHOW', 'Entertainment'],
        ['PVR', 'Entertainment'],
        ['INOX', 'Entertainment'],

        // Healthcare
        ['APOLLO', 'Healthcare'],
        ['MEDPLUS', 'Healthcare'],
        ['PHARMACY', 'Healthcare'],
        ['HOSPITAL', 'Healthcare'],
        ['CLINIC', 'Healthcare'],
        ['DOCTOR', 'Healthcare'],

        // Education
        ['UDEMY', 'Education'],
        ['COURSERA', 'Education'],
        ['SCHOOL', 'Education'],
        ['COLLEGE', 'Education'],
        ['UNIVERSITY', 'Education'],
        ['TUITION', 'Education'],

        // Groceries
        ['BIGBASKET', 'Groceries'],
        ['GROFERS', 'Groceries'],
        ['BLINKIT', 'Groceries'],
        ['DMART', 'Groceries'],
        ['RELIANCE', 'Groceries'],
        ['SUPERMARKET', 'Groceries'],

        // Travel
        ['MAKEMYTRIP', 'Travel'],
        ['GOIBIBO', 'Travel'],
        ['CLEARTRIP', 'Travel'],
        ['IRCTC', 'Travel'],
        ['HOTEL', 'Travel'],
        ['FLIGHT', 'Travel'],

        // Transfer
        ['UPI', 'Transfer'],
        ['NEFT', 'Transfer'],
        ['IMPS', 'Transfer'],
        ['RTGS', 'Transfer'],
    ]);

    /**
     * Categorize based on merchant name (rule-based)
     */
    private categorizeByMerchant(merchant: string): CategoryPrediction | null {
        if (!merchant) return null;

        const upperMerchant = merchant.toUpperCase();

        // Exact match
        if (this.merchantRules.has(upperMerchant)) {
            return {
                category: this.merchantRules.get(upperMerchant)!,
                confidence: 0.95
            };
        }

        // Partial match
        for (const [key, category] of this.merchantRules.entries()) {
            if (upperMerchant.includes(key) || key.includes(upperMerchant)) {
                return {
                    category,
                    confidence: 0.85
                };
            }
        }

        return null;
    }

    /**
     * Categorize based on keywords in description
     */
    private categorizeByKeywords(description: string): CategoryPrediction | null {
        if (!description) return null;

        const lowerDesc = description.toLowerCase();

        const keywordMap: Array<{ keywords: string[]; category: Category; confidence: number }> = [
            { keywords: ['food', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 'restaurant'], category: 'Food & Dining', confidence: 0.8 },
            { keywords: ['shop', 'purchase', 'buy', 'order'], category: 'Shopping', confidence: 0.7 },
            { keywords: ['taxi', 'cab', 'ride', 'transport', 'metro', 'bus'], category: 'Transportation', confidence: 0.8 },
            { keywords: ['bill', 'electricity', 'water', 'gas', 'recharge', 'mobile'], category: 'Bills & Utilities', confidence: 0.8 },
            { keywords: ['movie', 'entertainment', 'subscription', 'music'], category: 'Entertainment', confidence: 0.75 },
            { keywords: ['medicine', 'pharmacy', 'hospital', 'doctor', 'health'], category: 'Healthcare', confidence: 0.85 },
            { keywords: ['course', 'education', 'school', 'college', 'tuition'], category: 'Education', confidence: 0.85 },
            { keywords: ['grocery', 'vegetables', 'fruits', 'supermarket'], category: 'Groceries', confidence: 0.8 },
            { keywords: ['hotel', 'flight', 'travel', 'trip', 'booking'], category: 'Travel', confidence: 0.8 },
            { keywords: ['transfer', 'upi', 'neft', 'imps', 'sent to'], category: 'Transfer', confidence: 0.9 },
        ];

        for (const { keywords, category, confidence } of keywordMap) {
            if (keywords.some(kw => lowerDesc.includes(kw))) {
                return { category, confidence };
            }
        }

        return null;
    }

    /**
     * Main categorization function
     */
    categorize(merchant: string | null, description: string = '', amount?: number): CategoryPrediction {
        // Try merchant-based categorization first (higher confidence)
        if (merchant) {
            const merchantResult = this.categorizeByMerchant(merchant);
            if (merchantResult) {
                return merchantResult;
            }
        }

        // Try keyword-based categorization
        const keywordResult = this.categorizeByKeywords(description);
        if (keywordResult) {
            return keywordResult;
        }

        // Default to Others with low confidence
        return {
            category: 'Others',
            confidence: 0.3
        };
    }

    /**
     * Batch categorize multiple transactions
     */
    categorizeBatch(transactions: Array<{ merchant: string | null; description?: string; amount?: number }>): CategoryPrediction[] {
        return transactions.map(t => this.categorize(t.merchant, t.description, t.amount));
    }

    /**
     * Get all available categories
     */
    getCategories(): readonly Category[] {
        return CATEGORIES;
    }
}

export const transactionCategorizer = new TransactionCategorizer();
