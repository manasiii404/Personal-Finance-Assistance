// Quick test script to check family data
// Run this in the backend directory: node check-family.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFamilyData() {
    console.log('='.repeat(60));
    console.log('  FAMILY DATA CHECK');
    console.log('='.repeat(60));

    try {
        // Get all families
        const families = await prisma.family.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                members: {
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
        });

        console.log(`\n📊 Total Families: ${families.length}\n`);

        if (families.length === 0) {
            console.log('❌ No families found in database!');
            console.log('\nPossible issues:');
            console.log('  1. Family creation failed silently');
            console.log('  2. Database connection issue');
            console.log('  3. Wrong database being queried');
        } else {
            families.forEach((family, index) => {
                console.log(`Family ${index + 1}:`);
                console.log(`  Name: ${family.name}`);
                console.log(`  Room Code: ${family.roomCode}`);
                console.log(`  Creator: ${family.creator.name} (${family.creator.email})`);
                console.log(`  Active: ${family.isActive}`);
                console.log(`  Members: ${family.members.length}`);
                
                family.members.forEach((member, mIndex) => {
                    console.log(`    ${mIndex + 1}. ${member.user.name} - ${member.role} - ${member.status} - ${member.permissions}`);
                });
                console.log('');
            });
        }

        // Get all family members
        const allMembers = await prisma.familyMember.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                family: {
                    select: {
                        id: true,
                        name: true,
                        roomCode: true,
                    },
                },
            },
        });

        console.log(`\n📋 Total Family Members: ${allMembers.length}\n`);

        if (allMembers.length > 0) {
            console.log('Member Details:');
            allMembers.forEach((member, index) => {
                console.log(`  ${index + 1}. ${member.user.name} in "${member.family.name}"`);
                console.log(`     Status: ${member.status}`);
                console.log(`     Role: ${member.role}`);
                console.log(`     Permissions: ${member.permissions}`);
                console.log('');
            });
        }

        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        console.log(`\n👥 Total Users: ${users.length}\n`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name || 'No name'} (${user.email})`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await prisma.$disconnect();
    }

    console.log('\n' + '='.repeat(60));
}

checkFamilyData();
