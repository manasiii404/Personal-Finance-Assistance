const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  console.log('🔄 Promoting members to ADMIN in "Manasi\'s Fam"...');

  const family = await prisma.family.findFirst({
    where: { roomCode: 'MANASI' },
  });

  if (!family) {
    console.log('❌ Family "Manasi\'s Fam" not found');
    return;
  }

  // Promote test user (t1@g.com)
  const testUser = await prisma.user.findUnique({
    where: { email: 't1@g.com' },
  });

  if (testUser) {
    const updated = await prisma.familyMember.update({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId: testUser.id,
        },
      },
      data: {
        role: 'ADMIN',
        permissions: 'VIEW_EDIT',
      },
      include: {
        user: true,
      }
    });
    console.log(`✅ Promoted ${updated.user.name} (${updated.user.email}) to ADMIN`);
  } else {
    console.log('❌ Test user t1@g.com not found');
  }

  // Check demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  });

  if (demoUser) {
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId: demoUser.id,
        },
      },
    });
    console.log(`ℹ️ Demo User is currently: ${member.role} (Creator has Admin privileges)`);
  }
}

promoteToAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
