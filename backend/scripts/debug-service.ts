import { TransactionService } from '../src/services/transactionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Testing TransactionService...');

    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@example.com' }
    });

    if (!demoUser) {
        console.log('❌ Demo user not found');
        return;
    }

    console.log('Calling TransactionService.getTransactions with type="income" and date range...');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);

    console.log(`Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
        const result = await TransactionService.getTransactions(demoUser.id, {
            type: 'income',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            page: 1,
            limit: 100
        });

        console.log(`\n💰 Service returned ${result.data.length} transactions`);

        if (result.data.length > 0) {
            const categories = [...new Set(result.data.map((t: any) => t.category))];
            console.log('Categories returned by Service:', JSON.stringify(categories));
            console.log('Sample transaction type:', result.data[0].type);
        } else {
            console.log('❌ No transactions found in this date range!');

            // Check if there are ANY income transactions
            const allIncome = await prisma.transaction.count({
                where: { userId: demoUser.id, type: 'INCOME' }
            });
            console.log(`Total INCOME transactions in DB (ignoring date): ${allIncome}`);

            if (allIncome > 0) {
                const latest = await prisma.transaction.findFirst({
                    where: { userId: demoUser.id, type: 'INCOME' },
                    orderBy: { date: 'desc' }
                });
                console.log('Latest INCOME transaction date:', latest?.date);
            }
        }

    } catch (error) {
        console.error('Error calling service:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
