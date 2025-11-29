import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const output: string[] = [];
    const log = (msg: any) => {
        console.log(msg);
        output.push(typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2));
    };

    log('🔍 Inspecting Database Data...');

    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@example.com' }
    });

    if (!demoUser) {
        log('❌ Demo user not found');
        fs.writeFileSync('debug_output.txt', output.join('\n'));
        return;
    }

    // Check Income Transactions
    const incomeTransactions = await prisma.transaction.findMany({
        where: {
            userId: demoUser.id,
            type: 'INCOME'
        },
        select: {
            category: true,
            amount: true,
            type: true
        }
    });

    log(`\n💰 INCOME Transactions found: ${incomeTransactions.length}`);
    const incomeCategories = [...new Set(incomeTransactions.map(t => t.category))];
    log(`Categories present in INCOME transactions: ${JSON.stringify(incomeCategories)}`);

    // Check Expense Transactions
    const expenseTransactions = await prisma.transaction.findMany({
        where: {
            userId: demoUser.id,
            type: 'EXPENSE'
        },
        select: {
            category: true,
            amount: true,
            type: true
        }
    });

    log(`\n💸 EXPENSE Transactions found: ${expenseTransactions.length}`);
    const expenseCategories = [...new Set(expenseTransactions.map(t => t.category))];
    log(`Categories present in EXPENSE transactions: ${JSON.stringify(expenseCategories)}`);

    // Check for "Food" category specifically
    const foodTransactions = await prisma.transaction.findMany({
        where: {
            userId: demoUser.id,
            category: { contains: 'Food' }
        },
        select: {
            category: true,
            type: true
        }
    });
    log(`\n🍔 Food Transactions: ${foodTransactions.length}`);
    if (foodTransactions.length > 0) {
        log(`Sample Food Transaction Type: ${foodTransactions[0].type}`);
    }

    fs.writeFileSync('debug_output.txt', output.join('\n'));
    console.log('✅ Debug output written to debug_output.txt');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
