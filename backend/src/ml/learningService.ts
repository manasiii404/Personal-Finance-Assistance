/**
 * Learning Service (Simplified - In-Memory)
 * Collects user corrections and triggers model retraining
 */

interface TrainingDataItem {
    merchant: string;
    amount: number;
    originalCategory: string;
    userCategory: string;
    description?: string;
    transactionType: 'income' | 'expense';
    userId: string;
    usedForTraining: boolean;
    createdAt: Date;
}

class LearningService {
    private trainingData: TrainingDataItem[] = [];

    /**
     * Record user's category correction
     */
    async recordCorrection(data: {
        merchant: string;
        amount: number;
        originalCategory: string;
        userCategory: string;
        description?: string;
        transactionType: 'income' | 'expense';
        userId: string;
    }) {
        try {
            const trainingDataItem: TrainingDataItem = {
                ...data,
                usedForTraining: false,
                createdAt: new Date()
            };

            this.trainingData.push(trainingDataItem);

            console.log(`📚 Recorded training data: ${data.merchant} → ${data.userCategory}`);

            // Check if we should retrain
            await this.checkAndRetrain(data.userId);

            return trainingDataItem;
        } catch (error) {
            console.error('Error recording correction:', error);
            throw error;
        }
    }

    /**
     * Get count of unused training data
     */
    async getUnusedTrainingCount(userId?: string): Promise<number> {
        try {
            let data = this.trainingData.filter(d => !d.usedForTraining);

            if (userId) {
                data = data.filter(d => d.userId === userId);
            }

            return data.length;
        } catch (error) {
            console.error('Error getting training count:', error);
            return 0;
        }
    }

    /**
     * Check if we should retrain and trigger if needed
     */
    async checkAndRetrain(userId: string) {
        try {
            const unusedCount = await this.getUnusedTrainingCount(userId);

            console.log(`📊 Unused training data: ${unusedCount}`);

            // Retrain every 20-30 transactions
            if (unusedCount >= 20) {
                console.log('🔄 Triggering model retraining...');
                await this.retrainModel(userId);
            }
        } catch (error) {
            console.error('Error checking retrain:', error);
        }
    }

    /**
     * Retrain the categorization model
     */
    async retrainModel(userId: string) {
        try {
            // Get unused training data
            const trainingDataItems = this.trainingData
                .filter(d => d.userId === userId && !d.usedForTraining)
                .slice(0, 100);

            if (trainingDataItems.length === 0) {
                console.log('⚠️ No training data available');
                return;
            }

            console.log(`🎓 Retraining with ${trainingDataItems.length} samples...`);

            // Prepare training data
            const samples = trainingDataItems.map(data => ({
                merchant: data.merchant,
                amount: data.amount,
                category: data.userCategory,
                description: data.description || '',
                type: data.transactionType
            }));

            // Update merchant rules based on user corrections
            await this.updateMerchantRules(samples);

            // Mark data as used
            trainingDataItems.forEach(item => {
                item.usedForTraining = true;
            });

            console.log('✅ Model retrained successfully!');

            return {
                success: true,
                samplesUsed: trainingDataItems.length
            };
        } catch (error) {
            console.error('Error retraining model:', error);
            throw error;
        }
    }

    /**
     * Update merchant categorization rules based on user data
     */
    private async updateMerchantRules(samples: any[]) {
        // Group by merchant
        const merchantCategories = new Map<string, Map<string, number>>();

        for (const sample of samples) {
            const merchant = sample.merchant.toUpperCase();

            if (!merchantCategories.has(merchant)) {
                merchantCategories.set(merchant, new Map());
            }

            const categories = merchantCategories.get(merchant)!;
            const currentCount = categories.get(sample.category) || 0;
            categories.set(sample.category, currentCount + 1);
        }

        // Find most common category for each merchant
        const rules: Array<{ merchant: string; category: string; confidence: number }> = [];

        for (const [merchant, categories] of merchantCategories.entries()) {
            let maxCategory = '';
            let maxCount = 0;
            let totalCount = 0;

            for (const [category, count] of categories.entries()) {
                totalCount += count;
                if (count > maxCount) {
                    maxCount = count;
                    maxCategory = category;
                }
            }

            const confidence = maxCount / totalCount;

            if (confidence >= 0.6) { // Only add if 60%+ confidence
                rules.push({
                    merchant,
                    category: maxCategory,
                    confidence
                });
            }
        }

        console.log(`📝 Updated ${rules.length} merchant rules`);

        // TODO: In production, save these rules to a database or file
        // For now, they're just logged
        return rules;
    }

    /**
     * Get training statistics
     */
    async getTrainingStats(userId: string) {
        try {
            const userData = this.trainingData.filter(d => d.userId === userId);
            const total = userData.length;
            const unused = userData.filter(d => !d.usedForTraining).length;
            const used = total - unused;

            return {
                total,
                used,
                unused,
                nextRetrainAt: Math.max(0, 20 - unused),
                readyForRetrain: unused >= 20
            };
        } catch (error) {
            console.error('Error getting training stats:', error);
            return {
                total: 0,
                used: 0,
                unused: 0,
                nextRetrainAt: 20,
                readyForRetrain: false
            };
        }
    }

    /**
     * Get user's learned merchant patterns
     */
    async getUserPatterns(userId: string, limit: number = 50) {
        try {
            const userData = this.trainingData.filter(d => d.userId === userId);

            // Group by merchant and category
            const patterns = new Map<string, {
                merchant: string;
                category: string;
                count: number;
                totalAmount: number;
            }>();

            for (const data of userData) {
                const key = `${data.merchant}-${data.userCategory}`;

                if (!patterns.has(key)) {
                    patterns.set(key, {
                        merchant: data.merchant,
                        category: data.userCategory,
                        count: 0,
                        totalAmount: 0
                    });
                }

                const pattern = patterns.get(key)!;
                pattern.count++;
                pattern.totalAmount += data.amount;
            }

            // Convert to array and sort by frequency
            const result = Array.from(patterns.values())
                .map(p => ({
                    merchant: p.merchant,
                    category: p.category,
                    frequency: p.count,
                    avgAmount: Math.round(p.totalAmount / p.count)
                }))
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, limit);

            return result;
        } catch (error) {
            console.error('Error getting user patterns:', error);
            return [];
        }
    }
}

export const learningService = new LearningService();
