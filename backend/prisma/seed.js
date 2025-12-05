const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

  // Create second user for family
  const hashedPassword2 = await bcrypt.hash('test123', 12);

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

  // Generate transactions
  const transactions = [];
  const today = new Date();

  // Income transactions for demo user
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
        source: 'Bank Transfer',
      });
    });
  });

  // Expense categories
  const expenseCategories = [
    {
      category: 'Food', items: [
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
      category: 'Bills', items: [
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
  ];

  // Generate expenses for demo user
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

  // Generate transactions for test user
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

  // Generate expenses for test user
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

  // Create all transactions
  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log(`✅ ${transactions.length} transactions created`);

  // Create goals for demo user
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
  ];

  for (const goal of goals) {
    await prisma.goal.create({
      data: {
        userId: demoUser.id,
        ...goal,
      },
    });
  }

  console.log('✅ Goals created for demo user');

  // Create goals for test user
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
    await prisma.goal.create({
      data: {
        userId: testUser.id,
        ...goal,
      },
    });
  }

  console.log('✅ Goals created for test user');

  // Create Manasi's Fam family room
  const family = await prisma.family.create({
    data: {
      name: "Manasi's Fam",
      roomCode: 'MANASI',
      creatorId: demoUser.id,
    },
  });

  console.log('✅ Family "Manasi\'s Fam" created');

  // Add demo user as creator/admin
  await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: demoUser.id,
      role: 'CREATOR',
      permissions: 'VIEW_EDIT',
      status: 'ACCEPTED',
    },
  });

  // Add test user as member with VIEW_EDIT permission
  await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: testUser.id,
      role: 'MEMBER',
      permissions: 'VIEW_EDIT',
      status: 'ACCEPTED',
    },
  });

  console.log('✅ Family members added to "Manasi\'s Fam"');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: demo@example.com, t1@g.com`);
  console.log(`   - Family: "Manasi's Fam" (Room Code: MANASI)`);
  console.log(`   - Transactions: ${transactions.length} (both users)`);
  console.log(`   - Goals: ${goals.length + testUserGoals.length} (both users)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
