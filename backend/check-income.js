// Check what income transactions exist in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIncomeTransactions() {
  try {
    // Get all income transactions
    const incomeTransactions = await prisma.transaction.findMany({
      where: { type: 'INCOME' },
      take: 10,
      orderBy: { date: 'desc' }
    });

    console.log('\n=== INCOME TRANSACTIONS CHECK ===');
    console.log(`Total INCOME transactions found: ${incomeTransactions.length}`);
    
    if (incomeTransactions.length > 0) {
      console.log('\nIncome transactions:');
      incomeTransactions.forEach((t, i) => {
        console.log(`${i + 1}. ${t.category} - $${t.amount} - ${t.date}`);
      });

      // Group by category
      const byCategory = incomeTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      console.log('\nIncome by category:');
      Object.entries(byCategory).forEach(([cat, amt]) => {
        console.log(`  ${cat}: $${amt}`);
      });
    } else {
      console.log('\n❌ NO INCOME TRANSACTIONS FOUND!');
      console.log('This is why Income Analysis shows expense categories.');
      console.log('The API is falling back to expense data.');
    }

    // Also check expense transactions for comparison
    const expenseTransactions = await prisma.transaction.findMany({
      where: { type: 'EXPENSE' },
      take: 5,
    });

    console.log(`\n📊 For comparison: ${expenseTransactions.length} EXPENSE transactions found`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkIncomeTransactions();
