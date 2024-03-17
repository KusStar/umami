require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  await prisma.$connect();
  await prisma.$executeRaw`VACUUM`;
  prisma.$disconnect();
})();
