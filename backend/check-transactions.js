// Quick test script to check if transactions exist in database
// Run this in your backend terminal

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { date: 'desc' }
    });

    console.log('\n=== TRANSACTION CHECK ===');
    console.log(`Total transactions found: ${transactions.length}`);
    
    if (transactions.length > 0) {
      console.log('\nSample transactions:');
      transactions.forEach((t, i) => {
        console.log(`${i + 1}. ${t.type.toUpperCase()} - ${t.category} - $${t.amount} - ${t.date}`);
      });

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      console.log(`\nTotal Income: $${totalIncome}`);
      console.log(`Total Expenses: $${totalExpenses}`);
    } else {
      console.log('\n❌ NO TRANSACTIONS FOUND IN DATABASE!');
      console.log('You need to add transactions first.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkTransactions();
