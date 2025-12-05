// Check for Manasi's Room in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkManasisRoom() {
    console.log('Searching for Manasi\'s Room...\n');

    try {
        // Find family by name
        const family = await prisma.family.findFirst({
            where: {
                name: {
                    contains: 'Manasi',
                    mode: 'insensitive'
                }
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        if (family) {
            console.log('✅ Found Manasi\'s Room!');
            console.log(JSON.stringify(family, null, 2));
        } else {
            console.log('❌ Manasi\'s Room NOT found in database');
            
            // Show all families
            const allFamilies = await prisma.family.findMany({
                select: { id: true, name: true, roomCode: true, creatorId: true }
            });
            console.log('\nAll families in database:');
            allFamilies.forEach(f => {
                console.log(`  - ${f.name} (${f.roomCode}) by ${f.creatorId}`);
            });
        }

        // Also check by room code
        const byCode = await prisma.family.findFirst({
            where: { roomCode: 'JFRNIQ' },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        if (byCode) {
            console.log('\n✅ Found by room code JFRNIQ:');
            console.log(JSON.stringify(byCode, null, 2));
        } else {
            console.log('\n❌ No family with room code JFRNIQ');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkManasisRoom();
