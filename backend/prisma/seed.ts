import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  const categories = [
    // Income categories
    { name: 'Salary', type: 'INCOME' },
    { name: 'Freelance', type: 'INCOME' },
    { name: 'Investment', type: 'INCOME' },
    { name: 'Business', type: 'INCOME' },
    { name: 'Other Income', type: 'INCOME' },
    
    // Expense categories
    { name: 'Food', type: 'EXPENSE' },
    { name: 'Transportation', type: 'EXPENSE' },
    { name: 'Entertainment', type: 'EXPENSE' },
    { name: 'Shopping', type: 'EXPENSE' },
    { name: 'Bills', type: 'EXPENSE' },
    { name: 'Healthcare', type: 'EXPENSE' },
    { name: 'Education', type: 'EXPENSE' },
    { name: 'Travel', type: 'EXPENSE' },
    { name: 'Other Expense', type: 'EXPENSE' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // Create a demo user
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

  // Create sample transactions
  const sampleTransactions = [
    {
      userId: demoUser.id,
      date: new Date('2025-01-20'),
      description: 'Salary Credit',
      amount: 5000,
      category: 'Salary',
      type: 'INCOME' as const,
      source: 'Bank SMS',
    },
    {
      userId: demoUser.id,
      date: new Date('2025-01-19'),
      description: 'Grocery Shopping',
      amount: -120,
      category: 'Food',
      type: 'EXPENSE' as const,
      source: 'Card Transaction',
    },
    {
      userId: demoUser.id,
      date: new Date('2025-01-18'),
      description: 'Coffee Shop',
      amount: -8.50,
      category: 'Food',
      type: 'EXPENSE' as const,
      source: 'Mobile Payment',
    },
    {
      userId: demoUser.id,
      date: new Date('2025-01-17'),
      description: 'Gas Station',
      amount: -45,
      category: 'Transportation',
      type: 'EXPENSE' as const,
      source: 'Card Transaction',
    },
    {
      userId: demoUser.id,
      date: new Date('2025-01-16'),
      description: 'Freelance Project',
      amount: 800,
      category: 'Freelance',
      type: 'INCOME' as const,
      source: 'Bank Transfer',
    },
  ];

  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ Sample transactions created');

  // Create sample budgets
  const sampleBudgets = [
    {
      userId: demoUser.id,
      category: 'Food',
      limit: 500,
      spent: 128.50,
      period: 'MONTHLY' as const,
    },
    {
      userId: demoUser.id,
      category: 'Transportation',
      limit: 200,
      spent: 45,
      period: 'MONTHLY' as const,
    },
    {
      userId: demoUser.id,
      category: 'Entertainment',
      limit: 100,
      spent: 15.99,
      period: 'MONTHLY' as const,
    },
  ];

  for (const budget of sampleBudgets) {
    await prisma.budget.create({
      data: budget,
    });
  }

  console.log('✅ Sample budgets created');

  // Create sample goals
  const sampleGoals = [
    {
      userId: demoUser.id,
      title: 'Emergency Fund',
      target: 10000,
      current: 3500,
      deadline: new Date('2025-12-31'),
      category: 'Savings',
    },
    {
      userId: demoUser.id,
      title: 'Vacation Fund',
      target: 2000,
      current: 450,
      deadline: new Date('2025-06-30'),
      category: 'Travel',
    },
    {
      userId: demoUser.id,
      title: 'New Laptop',
      target: 1500,
      current: 800,
      deadline: new Date('2025-03-31'),
      category: 'Technology',
    },
  ];

  for (const goal of sampleGoals) {
    await prisma.goal.create({
      data: goal,
    });
  }

  console.log('✅ Sample goals created');

  // Create sample alerts
  const sampleAlerts = [
    {
      userId: demoUser.id,
      type: 'WARNING' as const,
      title: 'Budget Alert',
      message: 'You have exceeded 80% of your Food budget limit',
    },
    {
      userId: demoUser.id,
      type: 'SUCCESS' as const,
      title: 'Savings Milestone',
      message: 'Congratulations! You saved $500 this month',
    },
    {
      userId: demoUser.id,
      type: 'INFO' as const,
      title: 'Monthly Report',
      message: 'Your monthly financial report is ready',
      read: true,
    },
  ];

  for (const alert of sampleAlerts) {
    await prisma.alert.create({
      data: alert,
    });
  }

  console.log('✅ Sample alerts created');

  console.log('🎉 Database seeded successfully!');
  console.log('📧 Demo user email: demo@example.com');
  console.log('🔑 Demo user password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
