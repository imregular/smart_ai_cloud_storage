require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

async function main() {
  console.log("Attempting to connect to database...");
  try {
    await prisma.$connect();
    console.log("Successfully connected to database!");
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`Connection verified. User count: ${userCount}`);
  } catch (e) {
    console.error("Connection failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
