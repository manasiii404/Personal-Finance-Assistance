/**
 * Spam Detector
 * Detects spam/promotional SMS vs legitimate financial transactions
 */

export interface SpamDetectionResult {
    isSpam: boolean;
    confidence: number;
    reasons: string[];
}

class SpamDetector {
    // Promotional/spam keywords
    private spamKeywords = [
        'offer', 'free', 'win', 'prize', 'congratulations',
        'click here', 'limited time', 'hurry', 'urgent',
        'cashback upto', 'discount upto', 'sale',
        'subscribe', 'unsubscribe', 'reply', 'call now',
        'exclusive', 'special offer', 'bonus', 'reward points'
    ];

    // Transactional keywords (legitimate)
    private transactionalKeywords = [
        'debited', 'credited', 'withdrawn', 'deposited',
        'balance', 'transaction', 'payment successful',
        'paid', 'received', 'transfer', 'account'
    ];

    // Known promotional senders
    private spamSenders = [
        'AD-', 'PROMO', 'OFFER', 'DEALS', 'SALE',
        'MARKETING', 'ALERTS', 'INFO-'
    ];

    // Known legitimate financial senders
    private legitimateSenders = [
        'VK-', 'TM-', 'VM-', 'AX-',
        'HDFCBK', 'ICICIB', 'SBIIN', 'PNBSMS', 'BOISMS',
        'PAYTM', 'GPAY', 'PHONEPE', 'AMAZONP'
    ];

    /**
     * Check if sender is promotional
     */
    private isSpamSender(sender: string): boolean {
        const upperSender = sender.toUpperCase();
        return this.spamSenders.some(s => upperSender.includes(s));
    }

    /**
     * Check if sender is legitimate financial institution
     */
    private isLegitimSender(sender: string): boolean {
        const upperSender = sender.toUpperCase();
        return this.legitimateSenders.some(s => upperSender.includes(s));
    }

    /**
     * Count spam keywords in message
     */
    private countSpamKeywords(message: string): number {
        const lowerMessage = message.toLowerCase();
        return this.spamKeywords.filter(kw => lowerMessage.includes(kw)).length;
    }

    /**
     * Count transactional keywords in message
     */
    private countTransactionalKeywords(message: string): number {
        const lowerMessage = message.toLowerCase();
        return this.transactionalKeywords.filter(kw => lowerMessage.includes(kw)).length;
    }

    /**
     * Check if message contains URLs
     */
    private hasURL(message: string): boolean {
        const urlPattern = /(https?:\/\/|www\.)/i;
        return urlPattern.test(message);
    }

    /**
     * Calculate capitalization ratio
     */
    private getCapitalizationRatio(message: string): number {
        const letters = message.replace(/[^a-zA-Z]/g, '');
        if (letters.length === 0) return 0;

        const capitals = message.replace(/[^A-Z]/g, '');
        return capitals.length / letters.length;
    }

    /**
     * Main spam detection function
     */
    detect(message: string, sender: string): SpamDetectionResult {
        const reasons: string[] = [];
        let spamScore = 0;
        let legitScore = 0;

        // Check sender
        if (this.isSpamSender(sender)) {
            spamScore += 40;
            reasons.push('Promotional sender');
        }

        if (this.isLegitimSender(sender)) {
            legitScore += 40;
        }

        // Check keywords
        const spamKeywordCount = this.countSpamKeywords(message);
        const transactionalKeywordCount = this.countTransactionalKeywords(message);

        if (spamKeywordCount > 0) {
            spamScore += spamKeywordCount * 15;
            reasons.push(`Contains ${spamKeywordCount} promotional keyword(s)`);
        }

        if (transactionalKeywordCount > 0) {
            legitScore += transactionalKeywordCount * 20;
        }

        // Check for URLs
        if (this.hasURL(message)) {
            spamScore += 20;
            reasons.push('Contains URL');
        }

        // Check capitalization (ALL CAPS is often spam)
        const capRatio = this.getCapitalizationRatio(message);
        if (capRatio > 0.7) {
            spamScore += 15;
            reasons.push('Excessive capitalization');
        }

        // Check message length (very long messages are often promotional)
        if (message.length > 300) {
            spamScore += 10;
            reasons.push('Unusually long message');
        }

        // Calculate final confidence
        const totalScore = spamScore + legitScore;
        const spamConfidence = totalScore > 0 ? spamScore / totalScore : 0.5;

        return {
            isSpam: spamConfidence > 0.6,
            confidence: spamConfidence,
            reasons: reasons.length > 0 ? reasons : ['Legitimate transaction message']
        };
    }

    /**
     * Batch detect spam in multiple messages
     */
    detectBatch(messages: Array<{ body: string; sender: string }>): SpamDetectionResult[] {
        return messages.map(msg => this.detect(msg.body, msg.sender));
    }

    /**
     * Filter out spam messages
     */
    filterSpam(messages: Array<{ body: string; sender: string }>): Array<{ body: string; sender: string; spamResult: SpamDetectionResult }> {
        return messages.map(msg => ({
            ...msg,
            spamResult: this.detect(msg.body, msg.sender)
        })).filter(msg => !msg.spamResult.isSpam);
    }
}

export const spamDetector = new SpamDetector();
