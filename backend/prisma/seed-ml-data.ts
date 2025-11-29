import { config } from 'dotenv';
config();

import prisma from '../src/config/database';


const dummyTransactions = [
    // Food & Dining (30 transactions)
    { description: "Grocery shopping at Walmart", amount: -85.50, category: "Food", type: "EXPENSE", date: "2024-10-15" },
    { description: "Coffee at Starbucks", amount: -5.75, category: "Food", type: "EXPENSE", date: "2024-10-16" },
    { description: "Lunch at Chipotle", amount: -12.50, category: "Food", type: "EXPENSE", date: "2024-10-17" },
    { description: "Dinner at Olive Garden", amount: -45.00, category: "Food", type: "EXPENSE", date: "2024-10-18" },
    { description: "Grocery shopping at Target", amount: -92.30, category: "Food", type: "EXPENSE", date: "2024-10-20" },
    { description: "Pizza delivery from Dominos", amount: -28.50, category: "Food", type: "EXPENSE", date: "2024-10-22" },
    { description: "Breakfast at IHOP", amount: -18.75, category: "Food", type: "EXPENSE", date: "2024-10-23" },
    { description: "Grocery shopping at Whole Foods", amount: -105.20, category: "Food", type: "EXPENSE", date: "2024-10-25" },
    { description: "Coffee and pastry at local cafe", amount: -8.50, category: "Food", type: "EXPENSE", date: "2024-10-26" },
    { description: "Lunch at Subway", amount: -9.99, category: "Food", type: "EXPENSE", date: "2024-10-27" },
    { description: "Dinner at Red Lobster", amount: -67.80, category: "Food", type: "EXPENSE", date: "2024-10-28" },
    { description: "Grocery shopping at Costco", amount: -156.40, category: "Food", type: "EXPENSE", date: "2024-10-30" },
    { description: "Fast food at McDonald's", amount: -11.25, category: "Food", type: "EXPENSE", date: "2024-11-01" },
    { description: "Sushi dinner at local restaurant", amount: -52.00, category: "Food", type: "EXPENSE", date: "2024-11-02" },
    { description: "Grocery shopping at Kroger", amount: -78.90, category: "Food", type: "EXPENSE", date: "2024-11-05" },
    { description: "Coffee at Dunkin Donuts", amount: -4.50, category: "Food", type: "EXPENSE", date: "2024-11-06" },
    { description: "Lunch at Panera Bread", amount: -13.75, category: "Food", type: "EXPENSE", date: "2024-11-07" },
    { description: "Dinner at Cheesecake Factory", amount: -58.90, category: "Food", type: "EXPENSE", date: "2024-11-08" },
    { description: "Grocery shopping at Safeway", amount: -88.60, category: "Food", type: "EXPENSE", date: "2024-11-10" },
    { description: "Thai takeout", amount: -32.50, category: "Food", type: "EXPENSE", date: "2024-11-12" },
    { description: "Breakfast bagels and coffee", amount: -12.00, category: "Food", type: "EXPENSE", date: "2024-11-13" },
    { description: "Grocery shopping at Trader Joes", amount: -65.75, category: "Food", type: "EXPENSE", date: "2024-11-15" },
    { description: "Lunch at Chick-fil-A", amount: -10.50, category: "Food", type: "EXPENSE", date: "2024-11-16" },
    { description: "Italian dinner at local trattoria", amount: -72.30, category: "Food", type: "EXPENSE", date: "2024-11-17" },
    { description: "Grocery shopping at Aldi", amount: -54.20, category: "Food", type: "EXPENSE", date: "2024-11-20" },
    { description: "Coffee and muffin", amount: -7.25, category: "Food", type: "EXPENSE", date: "2024-11-21" },
    { description: "Burger and fries at Five Guys", amount: -16.80, category: "Food", type: "EXPENSE", date: "2024-11-22" },
    { description: "Grocery shopping at Publix", amount: -95.40, category: "Food", type: "EXPENSE", date: "2024-11-25" },
    { description: "Chinese takeout", amount: -38.75, category: "Food", type: "EXPENSE", date: "2024-11-26" },
    { description: "Brunch at local diner", amount: -24.50, category: "Food", type: "EXPENSE", date: "2024-11-27" },

    // Transportation (20 transactions)
    { description: "Gas at Shell station", amount: -45.00, category: "Transportation", type: "EXPENSE", date: "2024-10-14" },
    { description: "Uber ride to downtown", amount: -18.50, category: "Transportation", type: "EXPENSE", date: "2024-10-16" },
    { description: "Gas at BP", amount: -52.30, category: "Transportation", type: "EXPENSE", date: "2024-10-19" },
    { description: "Parking garage fee", amount: -12.00, category: "Transportation", type: "EXPENSE", date: "2024-10-21" },
    { description: "Car wash and detailing", amount: -35.00, category: "Transportation", type: "EXPENSE", date: "2024-10-23" },
    { description: "Gas at Chevron", amount: -48.75, category: "Transportation", type: "EXPENSE", date: "2024-10-26" },
    { description: "Lyft ride to airport", amount: -42.00, category: "Transportation", type: "EXPENSE", date: "2024-10-28" },
    { description: "Toll road charges", amount: -8.50, category: "Transportation", type: "EXPENSE", date: "2024-10-30" },
    { description: "Gas at Exxon", amount: -51.20, category: "Transportation", type: "EXPENSE", date: "2024-11-02" },
    { description: "Uber ride home", amount: -15.75, category: "Transportation", type: "EXPENSE", date: "2024-11-04" },
    { description: "Parking meter", amount: -5.00, category: "Transportation", type: "EXPENSE", date: "2024-11-06" },
    { description: "Gas at Mobil", amount: -46.90, category: "Transportation", type: "EXPENSE", date: "2024-11-09" },
    { description: "Car maintenance - oil change", amount: -65.00, category: "Transportation", type: "EXPENSE", date: "2024-11-11" },
    { description: "Uber to restaurant", amount: -12.50, category: "Transportation", type: "EXPENSE", date: "2024-11-13" },
    { description: "Gas at Costco", amount: -43.60, category: "Transportation", type: "EXPENSE", date: "2024-11-16" },
    { description: "Parking lot fee", amount: -10.00, category: "Transportation", type: "EXPENSE", date: "2024-11-18" },
    { description: "Lyft to office", amount: -14.25, category: "Transportation", type: "EXPENSE", date: "2024-11-20" },
    { description: "Gas at Shell", amount: -49.80, category: "Transportation", type: "EXPENSE", date: "2024-11-23" },
    { description: "Car wash", amount: -15.00, category: "Transportation", type: "EXPENSE", date: "2024-11-25" },
    { description: "Uber ride", amount: -16.90, category: "Transportation", type: "EXPENSE", date: "2024-11-27" },

    // Shopping (15 transactions)
    { description: "Amazon online purchase", amount: -67.99, category: "Shopping", type: "EXPENSE", date: "2024-10-15" },
    { description: "Clothing at H&M", amount: -85.50, category: "Shopping", type: "EXPENSE", date: "2024-10-18" },
    { description: "Electronics at Best Buy", amount: -245.00, category: "Shopping", type: "EXPENSE", date: "2024-10-22" },
    { description: "Home goods at Target", amount: -52.30, category: "Shopping", type: "EXPENSE", date: "2024-10-25" },
    { description: "Books from Barnes & Noble", amount: -34.99, category: "Shopping", type: "EXPENSE", date: "2024-10-28" },
    { description: "Shoes at Nike store", amount: -95.00, category: "Shopping", type: "EXPENSE", date: "2024-11-01" },
    { description: "Amazon Prime purchase", amount: -42.75, category: "Shopping", type: "EXPENSE", date: "2024-11-04" },
    { description: "Clothing at Zara", amount: -78.90, category: "Shopping", type: "EXPENSE", date: "2024-11-07" },
    { description: "Home decor at HomeGoods", amount: -63.50, category: "Shopping", type: "EXPENSE", date: "2024-11-10" },
    { description: "Office supplies at Staples", amount: -28.75, category: "Shopping", type: "EXPENSE", date: "2024-11-13" },
    { description: "Clothing at Gap", amount: -56.00, category: "Shopping", type: "EXPENSE", date: "2024-11-16" },
    { description: "Amazon purchase - household items", amount: -38.99, category: "Shopping", type: "EXPENSE", date: "2024-11-19" },
    { description: "Sporting goods at Dick's", amount: -112.50, category: "Shopping", type: "EXPENSE", date: "2024-11-22" },
    { description: "Cosmetics at Sephora", amount: -87.25, category: "Shopping", type: "EXPENSE", date: "2024-11-25" },
    { description: "Furniture at IKEA", amount: -189.00, category: "Shopping", type: "EXPENSE", date: "2024-11-27" },

    // Entertainment (12 transactions)
    { description: "Movie tickets at AMC", amount: -28.00, category: "Entertainment", type: "EXPENSE", date: "2024-10-17" },
    { description: "Netflix subscription", amount: -15.99, category: "Entertainment", type: "EXPENSE", date: "2024-10-20" },
    { description: "Concert tickets", amount: -125.00, category: "Entertainment", type: "EXPENSE", date: "2024-10-24" },
    { description: "Spotify Premium", amount: -10.99, category: "Entertainment", type: "EXPENSE", date: "2024-10-27" },
    { description: "Bowling night", amount: -35.50, category: "Entertainment", type: "EXPENSE", date: "2024-11-03" },
    { description: "Disney+ subscription", amount: -13.99, category: "Entertainment", type: "EXPENSE", date: "2024-11-06" },
    { description: "Video game purchase", amount: -59.99, category: "Entertainment", type: "EXPENSE", date: "2024-11-09" },
    { description: "Museum admission", amount: -22.00, category: "Entertainment", type: "EXPENSE", date: "2024-11-12" },
    { description: "HBO Max subscription", amount: -15.99, category: "Entertainment", type: "EXPENSE", date: "2024-11-15" },
    { description: "Mini golf and arcade", amount: -42.50, category: "Entertainment", type: "EXPENSE", date: "2024-11-18" },
    { description: "Movie streaming rental", amount: -5.99, category: "Entertainment", type: "EXPENSE", date: "2024-11-21" },
    { description: "Theme park tickets", amount: -95.00, category: "Entertainment", type: "EXPENSE", date: "2024-11-24" },

    // Bills & Utilities (10 transactions)
    { description: "Electric bill payment", amount: -125.50, category: "Bills", type: "EXPENSE", date: "2024-10-15" },
    { description: "Internet bill - Comcast", amount: -79.99, category: "Bills", type: "EXPENSE", date: "2024-10-18" },
    { description: "Water bill", amount: -45.30, category: "Bills", type: "EXPENSE", date: "2024-10-22" },
    { description: "Phone bill - Verizon", amount: -85.00, category: "Bills", type: "EXPENSE", date: "2024-10-25" },
    { description: "Gas utility bill", amount: -62.75, category: "Bills", type: "EXPENSE", date: "2024-11-01" },
    { description: "Electric bill payment", amount: -118.90, category: "Bills", type: "EXPENSE", date: "2024-11-05" },
    { description: "Internet bill - Comcast", amount: -79.99, category: "Bills", type: "EXPENSE", date: "2024-11-10" },
    { description: "Water bill", amount: -48.60, category: "Bills", type: "EXPENSE", date: "2024-11-15" },
    { description: "Phone bill - Verizon", amount: -85.00, category: "Bills", type: "EXPENSE", date: "2024-11-20" },
    { description: "Trash collection service", amount: -35.00, category: "Bills", type: "EXPENSE", date: "2024-11-25" },

    // Healthcare (8 transactions)
    { description: "Pharmacy - CVS prescription", amount: -25.50, category: "Healthcare", type: "EXPENSE", date: "2024-10-16" },
    { description: "Doctor visit copay", amount: -40.00, category: "Healthcare", type: "EXPENSE", date: "2024-10-21" },
    { description: "Dental cleaning", amount: -85.00, category: "Healthcare", type: "EXPENSE", date: "2024-10-29" },
    { description: "Pharmacy - Walgreens", amount: -18.75, category: "Healthcare", type: "EXPENSE", date: "2024-11-05" },
    { description: "Eye exam", amount: -95.00, category: "Healthcare", type: "EXPENSE", date: "2024-11-11" },
    { description: "Prescription refill", amount: -32.50, category: "Healthcare", type: "EXPENSE", date: "2024-11-17" },
    { description: "Gym membership", amount: -45.00, category: "Healthcare", type: "EXPENSE", date: "2024-11-22" },
    { description: "Vitamins and supplements", amount: -28.99, category: "Healthcare", type: "EXPENSE", date: "2024-11-26" },

    // Income (10 transactions)
    { description: "Monthly salary deposit", amount: 4500.00, category: "Salary", type: "INCOME", date: "2024-10-15" },
    { description: "Freelance project payment", amount: 850.00, category: "Salary", type: "INCOME", date: "2024-10-22" },
    { description: "Monthly salary deposit", amount: 4500.00, category: "Salary", type: "INCOME", date: "2024-11-01" },
    { description: "Bonus payment", amount: 1200.00, category: "Salary", type: "INCOME", date: "2024-11-08" },
    { description: "Side gig payment", amount: 325.00, category: "Salary", type: "INCOME", date: "2024-11-15" },
    { description: "Investment dividend", amount: 156.75, category: "Investment", type: "INCOME", date: "2024-10-18" },
    { description: "Stock sale profit", amount: 425.50, category: "Investment", type: "INCOME", date: "2024-10-28" },
    { description: "Cashback rewards", amount: 45.80, category: "Other", type: "INCOME", date: "2024-11-05" },
    { description: "Tax refund", amount: 680.00, category: "Other", type: "INCOME", date: "2024-11-12" },
    { description: "Gift money", amount: 200.00, category: "Other", type: "INCOME", date: "2024-11-20" },

    // Education (5 transactions)
    { description: "Online course - Udemy", amount: -49.99, category: "Education", type: "EXPENSE", date: "2024-10-19" },
    { description: "Textbooks purchase", amount: -125.00, category: "Education", type: "EXPENSE", date: "2024-10-26" },
    { description: "Professional certification exam", amount: -295.00, category: "Education", type: "EXPENSE", date: "2024-11-03" },
    { description: "Online course - Coursera", amount: -39.99, category: "Education", type: "EXPENSE", date: "2024-11-14" },
    { description: "Educational software license", amount: -89.00, category: "Education", type: "EXPENSE", date: "2024-11-23" },

    // Travel (5 transactions)
    { description: "Flight tickets", amount: -385.00, category: "Travel", type: "EXPENSE", date: "2024-10-20" },
    { description: "Hotel booking - Marriott", amount: -245.50, category: "Travel", type: "EXPENSE", date: "2024-10-27" },
    { description: "Airbnb rental", amount: -189.00, category: "Travel", type: "EXPENSE", date: "2024-11-08" },
    { description: "Rental car", amount: -156.75, category: "Travel", type: "EXPENSE", date: "2024-11-16" },
    { description: "Travel insurance", amount: -45.00, category: "Travel", type: "EXPENSE", date: "2024-11-24" },
];

async function seedTransactions() {
    try {
        console.log('🌱 Starting to seed dummy transactions...');

        // Get the first user (demo user or create one)
        let user = await prisma.user.findFirst();

        if (!user) {
            console.log('No user found. Creating demo user...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('demo123', 10);

            user = await prisma.user.create({
                data: {
                    email: 'demo@example.com',
                    password: hashedPassword,
                    name: 'Demo User',
                },
            });
            console.log('✅ Demo user created');
        }

        console.log(`📝 Using user: ${user.email} (${user.id})`);
        console.log(`📊 Creating ${dummyTransactions.length} transactions...`);

        // Create all transactions
        for (const txn of dummyTransactions) {
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    description: txn.description,
                    amount: txn.amount,
                    category: txn.category,
                    type: txn.type as any,
                    date: new Date(txn.date),
                    source: 'seed_script',
                },
            });
        }

        console.log(`✅ Successfully created ${dummyTransactions.length} transactions!`);
        console.log('\n📈 Transaction Summary:');
        console.log(`   - Food: 30 transactions`);
        console.log(`   - Transportation: 20 transactions`);
        console.log(`   - Shopping: 15 transactions`);
        console.log(`   - Entertainment: 12 transactions`);
        console.log(`   - Bills: 10 transactions`);
        console.log(`   - Income: 10 transactions`);
        console.log(`   - Healthcare: 8 transactions`);
        console.log(`   - Education: 5 transactions`);
        console.log(`   - Travel: 5 transactions`);
        console.log(`\n🎯 You can now train your ML models!`);
        console.log(`   Use: POST http://localhost:3000/api/ml/train/all`);

    } catch (error) {
        console.error('❌ Error seeding transactions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedTransactions();
