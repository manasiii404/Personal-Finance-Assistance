const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeDemoAdmin() {
  console.log('🔄 Changing demo user (Creator) role to ADMIN...');

  const family = await prisma.family.findFirst({
    where: { roomCode: 'MANASI' },
  });

  if (!family) {
    console.log('❌ Family "Manasi\'s Fam" not found');
    return;
  }

  // Find demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  });

  if (demoUser) {
    // Update role to ADMIN
    const updated = await prisma.familyMember.update({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId: demoUser.id,
        },
      },
      data: {
        role: 'ADMIN',
        permissions: 'VIEW_EDIT', // Ensure full permissions
      },
      include: {
        user: true,
      }
    });
    console.log(`✅ Changed ${updated.user.name} (${updated.user.email}) role to ADMIN`);
    console.log(`ℹ️ Note: This user is still the 'creatorId' of the family in the database.`);
  } else {
    console.log('❌ Demo user not found');
  }
}

makeDemoAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
