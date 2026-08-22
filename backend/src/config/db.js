const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const { databaseUrl, nodeEnv } = require('./env');

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: nodeEnv === 'production' ? ['warn', 'error'] : ['query', 'warn', 'error'],
});

module.exports = prisma;
