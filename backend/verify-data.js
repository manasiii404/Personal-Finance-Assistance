const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying data...');
  
  const family = await prisma.family.findFirst({
    where: { roomCode: 'MANASI' },
    include: { 
      members: {
        include: {
          user: true
        }
      } 
    }
  });

  if (!family) {
    console.log('❌ Family "Manasi\'s Fam" not found');
    return;
  }
  
  console.log(`✅ Found Family: ${family.name} (${family.roomCode})`);
  console.log(`   Members: ${family.members.length}`);
  
  for (const member of family.members) {
    const txCount = await prisma.transaction.count({
      where: { userId: member.userId }
    });
    const goalCount = await prisma.goal.count({
      where: { userId: member.userId }
    });
    console.log(`   - ${member.user.email}: ${txCount} transactions, ${goalCount} goals`);
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
