const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

module.exports = {
  schema: path.join(__dirname, 'src/prisma/schema.prisma'),
  env: process.env.NODE_ENV || 'development',
};
