import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
    console.log('🧹 Starting database cleanup...\n');

    try {
        // Clean up duplicate goals
        console.log('📊 Cleaning duplicate goals...');
        const allGoals = await prisma.goal.findMany({
            orderBy: { createdAt: 'asc' } // Keep oldest first
        });

        const seenGoalTitles = new Map<string, string>(); // title -> id
        const duplicateGoalIds: string[] = [];

        for (const goal of allGoals) {
            const key = `${goal.userId}-${goal.title}`;
            if (seenGoalTitles.has(key)) {
                duplicateGoalIds.push(goal.id);
                console.log(`  ❌ Found duplicate: "${goal.title}" (ID: ${goal.id})`);
            } else {
                seenGoalTitles.set(key, goal.id);
                console.log(`  ✅ Keeping: "${goal.title}" (ID: ${goal.id})`);
            }
        }

        if (duplicateGoalIds.length > 0) {
            await prisma.goal.deleteMany({
                where: { id: { in: duplicateGoalIds } }
            });
            console.log(`\n✅ Deleted ${duplicateGoalIds.length} duplicate goals\n`);
        } else {
            console.log('\n✅ No duplicate goals found\n');
        }

        // Clean up duplicate budgets
        console.log('💰 Cleaning duplicate budgets...');
        const allBudgets = await prisma.budget.findMany({
            orderBy: { createdAt: 'asc' } // Keep oldest first
        });

        const seenBudgetKeys = new Map<string, string>(); // key -> id
        const duplicateBudgetIds: string[] = [];

        for (const budget of allBudgets) {
            const key = `${budget.userId}-${budget.category}-${budget.period}`;
            if (seenBudgetKeys.has(key)) {
                duplicateBudgetIds.push(budget.id);
                console.log(`  ❌ Found duplicate: "${budget.category}" (${budget.period}) (ID: ${budget.id})`);
            } else {
                seenBudgetKeys.set(key, budget.id);
                console.log(`  ✅ Keeping: "${budget.category}" (${budget.period}) (ID: ${budget.id})`);
            }
        }

        if (duplicateBudgetIds.length > 0) {
            await prisma.budget.deleteMany({
                where: { id: { in: duplicateBudgetIds } }
            });
            console.log(`\n✅ Deleted ${duplicateBudgetIds.length} duplicate budgets\n`);
        } else {
            console.log('\n✅ No duplicate budgets found\n');
        }

        console.log('🎉 Database cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup
cleanupDuplicates()
    .then(() => {
        console.log('\n✨ All done! You can now refresh your browser.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to cleanup database:', error);
        process.exit(1);
    });
