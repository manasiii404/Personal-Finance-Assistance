import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);

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

  // Generate 100+ diverse transactions over the past 6 months
  const transactions = [];
  const today = new Date();

  // Income transactions (20 total)
  const incomeTransactions = [
    // Salary (monthly)
    { desc: 'Monthly Salary', amount: 5000, category: 'Salary', months: [0, 1, 2, 3, 4, 5] },
    // Freelance (irregular)
    { desc: 'Freelance Web Design', amount: 1200, category: 'Freelance', months: [0, 2, 4] },
    { desc: 'Consulting Project', amount: 800, category: 'Freelance', months: [1, 3] },
    // Investment (quarterly)
    { desc: 'Stock Dividends', amount: 350, category: 'Investment', months: [0, 3] },
    { desc: 'Mutual Fund Returns', amount: 500, category: 'Investment', months: [1, 4] },
    // Business
    { desc: 'Side Business Revenue', amount: 600, category: 'Business', months: [0, 2, 5] },
    // Gifts
    { desc: 'Birthday Gift', amount: 200, category: 'Gifts', months: [2] },
    { desc: 'Holiday Bonus', amount: 1000, category: 'Gifts', months: [5] },
    // Other
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
        type: 'INCOME' as const,
        source: item.category === 'Salary' ? 'Bank Transfer' : 'Bank Transfer',
      });
    });
  });

  // Expense transactions (80+ total)
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

  // Generate expenses over 6 months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    expenseCategories.forEach(cat => {
      // 2-4 transactions per category per month
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
          type: 'EXPENSE' as const,
          source: amount > 100 ? 'Card Transaction' : 'Mobile Payment',
        });
      }
    });
  }

  // Create all transactions
  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log(`✅ ${transactions.length} transactions created`);

  // Create comprehensive budgets
  const budgets = [
    { category: 'Food & Dining', limit: 500, spent: 420, period: 'MONTHLY' as const },
    { category: 'Transportation', limit: 300, spent: 280, period: 'MONTHLY' as const },
    { category: 'Shopping', limit: 400, spent: 350, period: 'MONTHLY' as const },
    { category: 'Entertainment', limit: 200, spent: 180, period: 'MONTHLY' as const },
    { category: 'Bills & Utilities', limit: 350, spent: 320, period: 'MONTHLY' as const },
    { category: 'Healthcare', limit: 250, spent: 200, period: 'MONTHLY' as const },
    { category: 'Education', limit: 300, spent: 150, period: 'MONTHLY' as const },
    { category: 'Travel', limit: 600, spent: 450, period: 'MONTHLY' as const },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        ...budget,
      },
    });
  }

  console.log('✅ Budgets created');

  // Create diverse goals
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
    await prisma.goal.create({
      data: {
        userId: demoUser.id,
        ...goal,
      },
    });
  }

  console.log('✅ Goals created');

  // Create varied alerts
  const alerts = [
    {
      type: 'WARNING' as const,
      title: 'Budget Alert',
      message: 'You have spent 84% of your Food & Dining budget',
      read: false,
    },
    {
      type: 'SUCCESS' as const,
      title: 'Goal Progress',
      message: 'You are 80% towards your New Laptop goal!',
      read: false,
    },
    {
      type: 'INFO' as const,
      title: 'Monthly Summary',
      message: 'Your monthly report is ready to view',
      read: true,
    },
    {
      type: 'ERROR' as const,
      title: 'Budget Exceeded',
      message: 'Transportation budget exceeded by ₹50',
      read: false,
    },
    {
      type: 'WARNING' as const,
      title: 'Unusual Spending',
      message: 'Higher than usual spending detected in Shopping category',
      read: false,
    },
    {
      type: 'SUCCESS' as const,
      title: 'Savings Milestone',
      message: 'Congratulations! You saved ₹1000 this month',
      read: true,
    },
    {
      type: 'INFO' as const,
      title: 'Bill Reminder',
      message: 'Electricity bill due in 3 days',
      read: false,
    },
    {
      type: 'WARNING' as const,
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
