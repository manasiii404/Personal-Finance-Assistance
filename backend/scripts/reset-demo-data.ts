import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Deleting demo user data...');

    // Find demo user
    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@example.com' }
    });

    if (!demoUser) {
        console.log('❌ Demo user not found');
        return;
    }

    // Delete all demo user's data
    await prisma.transaction.deleteMany({
        where: { userId: demoUser.id }
    });

    await prisma.budget.deleteMany({
        where: { userId: demoUser.id }
    });

    await prisma.goal.deleteMany({
        where: { userId: demoUser.id }
    });

    await prisma.alert.deleteMany({
        where: { userId: demoUser.id }
    });

    console.log('✅ Demo user data deleted');
    console.log('🌱 Now run: npx tsx prisma/seed.ts');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
