"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcryptjs_1.default.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            password: hashedPassword,
            name: 'Demo User',
        },
    });
    console.log('✅ Demo user created');
    const hashedPassword2 = await bcryptjs_1.default.hash('test123', 12);
    const testUser = await prisma.user.upsert({
        where: { email: 't1@g.com' },
        update: {},
        create: {
            email: 't1@g.com',
            password: hashedPassword2,
            name: 'Test User',
        },
    });
    console.log('✅ Test user created');
    const transactions = [];
    const today = new Date();
    const incomeTransactions = [
        { desc: 'Monthly Salary', amount: 5000, category: 'Salary', months: [0, 1, 2, 3, 4, 5] },
        { desc: 'Freelance Web Design', amount: 1200, category: 'Freelance', months: [0, 2, 4] },
        { desc: 'Consulting Project', amount: 800, category: 'Freelance', months: [1, 3] },
        { desc: 'Stock Dividends', amount: 350, category: 'Investment', months: [0, 3] },
        { desc: 'Mutual Fund Returns', amount: 500, category: 'Investment', months: [1, 4] },
        { desc: 'Side Business Revenue', amount: 600, category: 'Business', months: [0, 2, 5] },
        { desc: 'Birthday Gift', amount: 200, category: 'Gifts', months: [2] },
        { desc: 'Holiday Bonus', amount: 1000, category: 'Gifts', months: [5] },
        { desc: 'Rental Income', amount: 1500, category: 'Other', months: [0, 1, 2, 3, 4, 5] },
    ];
    incomeTransactions.forEach(item => {
        item.months.forEach(monthOffset => {
            const date = new Date(today);
            date.setMonth(date.getMonth() - monthOffset);
            date.setDate(Math.floor(Math.random() * 28) + 1);
            transactions.push({
                userId: demoUser.id,
                date,
                description: item.desc,
                amount: item.amount,
                category: item.category,
                type: 'INCOME',
                source: item.category === 'Salary' ? 'Bank Transfer' : 'Bank Transfer',
            });
        });
    });
    const expenseCategories = [
        {
            category: 'Food & Dining', items: [
                { desc: 'Grocery Shopping', min: 80, max: 150 },
                { desc: 'Restaurant Dinner', min: 30, max: 80 },
                { desc: 'Coffee Shop', min: 5, max: 15 },
                { desc: 'Fast Food', min: 10, max: 25 },
            ]
        },
        {
            category: 'Transportation', items: [
                { desc: 'Gas Station', min: 40, max: 60 },
                { desc: 'Uber Ride', min: 15, max: 35 },
                { desc: 'Car Maintenance', min: 100, max: 300 },
                { desc: 'Parking Fee', min: 5, max: 20 },
            ]
        },
        {
            category: 'Shopping', items: [
                { desc: 'Clothing Store', min: 50, max: 200 },
                { desc: 'Electronics', min: 100, max: 500 },
                { desc: 'Home Supplies', min: 30, max: 100 },
                { desc: 'Online Shopping', min: 25, max: 150 },
            ]
        },
        {
            category: 'Entertainment', items: [
                { desc: 'Movie Tickets', min: 15, max: 40 },
                { desc: 'Concert', min: 50, max: 150 },
                { desc: 'Streaming Services', min: 10, max: 30 },
                { desc: 'Gaming', min: 20, max: 60 },
            ]
        },
        {
            category: 'Bills & Utilities', items: [
                { desc: 'Electricity Bill', min: 80, max: 150 },
                { desc: 'Internet Bill', min: 50, max: 80 },
                { desc: 'Phone Bill', min: 30, max: 60 },
                { desc: 'Water Bill', min: 20, max: 40 },
            ]
        },
        {
            category: 'Healthcare', items: [
                { desc: 'Doctor Visit', min: 50, max: 150 },
                { desc: 'Pharmacy', min: 20, max: 80 },
                { desc: 'Gym Membership', min: 30, max: 60 },
                { desc: 'Health Insurance', min: 100, max: 200 },
            ]
        },
        {
            category: 'Education', items: [
                { desc: 'Online Course', min: 50, max: 200 },
                { desc: 'Books', min: 20, max: 80 },
                { desc: 'Tuition Fee', min: 200, max: 500 },
                { desc: 'Study Materials', min: 15, max: 50 },
            ]
        },
        {
            category: 'Travel', items: [
                { desc: 'Flight Tickets', min: 200, max: 600 },
                { desc: 'Hotel Booking', min: 100, max: 300 },
                { desc: 'Travel Insurance', min: 30, max: 80 },
                { desc: 'Vacation Expenses', min: 150, max: 400 },
            ]
        },
    ];
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        expenseCategories.forEach(cat => {
            const transactionsPerMonth = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < transactionsPerMonth; i++) {
                const item = cat.items[Math.floor(Math.random() * cat.items.length)];
                const amount = Math.floor(Math.random() * (item.max - item.min)) + item.min;
                const date = new Date(today);
                date.setMonth(date.getMonth() - monthOffset);
                date.setDate(Math.floor(Math.random() * 28) + 1);
                transactions.push({
                    userId: demoUser.id,
                    date,
                    description: item.desc,
                    amount: -amount,
                    category: cat.category,
                    type: 'EXPENSE',
                    source: amount > 100 ? 'Card Transaction' : 'Mobile Payment',
                });
            }
        });
    }
    const testUserIncomeTransactions = [
        { desc: 'Monthly Salary', amount: 4500, category: 'Salary', months: [0, 1, 2, 3, 4, 5] },
        { desc: 'Freelance Work', amount: 900, category: 'Freelance', months: [0, 2, 4] },
        { desc: 'Investment Returns', amount: 400, category: 'Investment', months: [1, 3] },
    ];
    testUserIncomeTransactions.forEach(item => {
        item.months.forEach(monthOffset => {
            const date = new Date(today);
            date.setMonth(date.getMonth() - monthOffset);
            date.setDate(Math.floor(Math.random() * 28) + 1);
            transactions.push({
                userId: testUser.id,
                date,
                description: item.desc,
                amount: item.amount,
                category: item.category,
                type: 'INCOME',
                source: 'Bank Transfer',
            });
        });
    });
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        expenseCategories.forEach(cat => {
            const transactionsPerMonth = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < transactionsPerMonth; i++) {
                const item = cat.items[Math.floor(Math.random() * cat.items.length)];
                const amount = Math.floor(Math.random() * (item.max - item.min) * 0.8) + item.min * 0.8;
                const date = new Date(today);
                date.setMonth(date.getMonth() - monthOffset);
                date.setDate(Math.floor(Math.random() * 28) + 1);
                transactions.push({
                    userId: testUser.id,
                    date,
                    description: item.desc,
                    amount: -amount,
                    category: cat.category,
                    type: 'EXPENSE',
                    source: amount > 100 ? 'Card Transaction' : 'Mobile Payment',
                });
            }
        });
    }
    for (const transaction of transactions) {
        await prisma.transaction.create({
            data: transaction,
        });
    }
    console.log(`✅ ${transactions.length} transactions created`);
    const budgets = [
        { category: 'Food & Dining', limit: 500, spent: 420, period: 'MONTHLY' },
        { category: 'Transportation', limit: 300, spent: 280, period: 'MONTHLY' },
        { category: 'Shopping', limit: 400, spent: 350, period: 'MONTHLY' },
        { category: 'Entertainment', limit: 200, spent: 180, period: 'MONTHLY' },
        { category: 'Bills & Utilities', limit: 350, spent: 320, period: 'MONTHLY' },
        { category: 'Healthcare', limit: 250, spent: 200, period: 'MONTHLY' },
        { category: 'Education', limit: 300, spent: 150, period: 'MONTHLY' },
        { category: 'Travel', limit: 600, spent: 450, period: 'MONTHLY' },
    ];
    for (const budget of budgets) {
        await prisma.budget.create({
            data: {
                userId: demoUser.id,
                ...budget,
            },
        });
    }
    console.log('✅ Budgets created for demo user');
    const goals = [
        {
            title: 'Emergency Fund',
            target: 10000,
            current: 6500,
            deadline: new Date(today.getFullYear() + 1, 11, 31),
            category: 'Savings',
        },
        {
            title: 'Vacation to Europe',
            target: 5000,
            current: 2800,
            deadline: new Date(today.getFullYear(), today.getMonth() + 6, 1),
            category: 'Travel',
        },
        {
            title: 'New Laptop',
            target: 1500,
            current: 1200,
            deadline: new Date(today.getFullYear(), today.getMonth() + 2, 1),
            category: 'Shopping',
        },
        {
            title: 'Investment Portfolio',
            target: 20000,
            current: 8500,
            deadline: new Date(today.getFullYear() + 2, 5, 30),
            category: 'Investment',
        },
        {
            title: 'Car Down Payment',
            target: 8000,
            current: 3200,
            deadline: new Date(today.getFullYear() + 1, 2, 15),
            category: 'Transportation',
        },
        {
            title: 'Home Renovation',
            target: 15000,
            current: 4500,
            deadline: new Date(today.getFullYear() + 1, 8, 1),
            category: 'Other',
        },
    ];
    for (const goal of goals) {
        const createdGoal = await prisma.goal.create({
            data: {
                userId: demoUser.id,
                ...goal,
            },
        });
        if (goal.current > 0) {
            await prisma.goalContribution.create({
                data: {
                    goalId: createdGoal.id,
                    userId: demoUser.id,
                    amount: goal.current,
                    date: new Date(),
                }
            });
        }
    }
    console.log('✅ Goals created for demo user');
    const testUserGoals = [
        {
            title: 'Vacation Fund',
            target: 3000,
            current: 1500,
            deadline: new Date(today.getFullYear(), today.getMonth() + 4, 1),
            category: 'Travel',
        },
        {
            title: 'Emergency Savings',
            target: 5000,
            current: 2000,
            deadline: new Date(today.getFullYear() + 1, 5, 30),
            category: 'Savings',
        },
    ];
    for (const goal of testUserGoals) {
        const createdGoal = await prisma.goal.create({
            data: {
                userId: testUser.id,
                ...goal,
            },
        });
        if (goal.current > 0) {
            await prisma.goalContribution.create({
                data: {
                    goalId: createdGoal.id,
                    userId: testUser.id,
                    amount: goal.current,
                    date: new Date(),
                }
            });
        }
    }
    console.log('✅ Goals created for test user');
    const family = await prisma.family.create({
        data: {
            name: "Manasi's Fam",
            roomCode: 'MANASI',
            creatorId: demoUser.id,
        },
    });
    console.log('✅ Family "Manasi\'s Fam" created');
    await prisma.familyMember.create({
        data: {
            familyId: family.id,
            userId: demoUser.id,
            role: 'CREATOR',
            permissions: 'VIEW_EDIT',
            status: 'ACCEPTED',
            isSharingTransactions: true,
        },
    });
    await prisma.familyMember.create({
        data: {
            familyId: family.id,
            userId: testUser.id,
            role: 'MEMBER',
            permissions: 'VIEW_EDIT',
            status: 'ACCEPTED',
            isSharingTransactions: true,
        },
    });
    console.log('✅ Family members added to "Manasi\'s Fam"');
    const alerts = [
        {
            type: 'WARNING',
            title: 'Budget Alert',
            message: 'You have spent 84% of your Food & Dining budget',
            read: false,
        },
        {
            type: 'SUCCESS',
            title: 'Goal Progress',
            message: 'You are 80% towards your New Laptop goal!',
            read: false,
        },
        {
            type: 'INFO',
            title: 'Monthly Summary',
            message: 'Your monthly report is ready to view',
            read: true,
        },
        {
            type: 'ERROR',
            title: 'Budget Exceeded',
            message: 'Transportation budget exceeded by ₹50',
            read: false,
        },
        {
            type: 'WARNING',
            title: 'Unusual Spending',
            message: 'Higher than usual spending detected in Shopping category',
            read: false,
        },
        {
            type: 'SUCCESS',
            title: 'Savings Milestone',
            message: 'Congratulations! You saved ₹1000 this month',
            read: true,
        },
        {
            type: 'INFO',
            title: 'Bill Reminder',
            message: 'Electricity bill due in 3 days',
            read: false,
        },
        {
            type: 'WARNING',
            title: 'Low Balance',
            message: 'Your Emergency Fund is below recommended level',
            read: true,
        },
    ];
    for (const alert of alerts) {
        await prisma.alert.create({
            data: {
                userId: demoUser.id,
                ...alert,
            },
        });
    }
    console.log('✅ Alerts created');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: demo@example.com, t1@g.com`);
    console.log(`   - Family: "Manasi's Fam" (Room Code: MANASI)`);
    console.log(`   - Transactions: ${transactions.length} (both users)`);
    console.log(`   - Budgets: ${budgets.length} (demo user)`);
    console.log(`   - Goals: ${goals.length + testUserGoals.length} (both users)`);
    console.log(`   - Alerts: ${alerts.length} (demo user)`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map