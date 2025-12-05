// Check what getUserFamily returns for Demo User
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetUserFamily() {
    const demoUserId = '692ac5aefde045484c5465a3'; // Demo User ID
    
    console.log('Testing getUserFamily for Demo User...\n');

    try {
        // This is what the backend does
        const membership = await prisma.familyMember.findFirst({
            where: {
                userId: demoUserId,
                status: 'ACCEPTED',
            },
            include: {
                family: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        members: {
                            where: { status: 'ACCEPTED' },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        console.log('Result from getUserFamily query:');
        console.log(JSON.stringify(membership, null, 2));

        if (membership) {
            console.log(`\n✅ Found family: ${membership.family.name}`);
            console.log(`   Room Code: ${membership.family.roomCode}`);
            console.log(`   User Role: ${membership.role}`);
        } else {
            console.log('\n❌ No membership found!');
        }

        // Also check ALL memberships for this user
        console.log('\n--- ALL Memberships for Demo User ---');
        const allMemberships = await prisma.familyMember.findMany({
            where: { userId: demoUserId },
            include: {
                family: {
                    select: { id: true, name: true, roomCode: true }
                }
            }
        });

        allMemberships.forEach(m => {
            console.log(`  - ${m.family.name} (${m.family.roomCode}): ${m.status} - ${m.role}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testGetUserFamily();
